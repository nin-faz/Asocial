# Audit Sécurité — Asocial

> Date : 2026-04-24  
> Scope : back/, front/, config files  
> Stack : GraphQL/Apollo + Prisma + Postgres/Supabase + React + Socket.IO + Cloudinary + ImgBB + Web Push

---

## Résumé Exécutif

| Sévérité | Nombre |
|----------|--------|
| HIGH | 7 |
| MEDIUM | 8 |
| LOW | 8 |

**Chaînes d'attaque critiques :**
- Full account takeover sur n'importe quel compte (password reset)
- Impersonation d'autres users sur les dislikes
- Lecture du feed privé de n'importe quel user (notifications)
- Désabonnement push forcé sans authentification
- DB full takeover si secrets leakés

---

## HIGH — Critique

### 1. Account Takeover via Password Reset
**Fichier :** `back/src/domain/user/requestPasswordReset.ts:8-35`

```ts
// email vient du CLIENT, pas de la DB — aucun email stocké sur User
const user = await db.user.findFirst({ where: { username: formattedUsername } });
await sendPasswordResetEmail(email, token, username); // email = celui du requêtant
```

**Scénario :** L'attaquant appelle `requestPasswordReset(username="victime", email="attacker@evil.com")`, reçoit le lien de reset, prend le compte. **Tout compte est takeable.**

**Fix :** Stocker un champ `email` sur le modèle `User` et utiliser `user.email` — jamais l'email venant du client.

---

### ✅ 2. IDOR sur les Notifications
**Fichier :** `back/src/domain/notification/queries.ts:3-28`

```ts
getNotifications: async (_, { userId, limit, offset }, { dataSources: { db } }) => {
  // context.user jamais vérifié
  const notifications = await db.notification.findMany({ where: { userId } });
```

**Scénario :** N'importe quel user authentifié peut lire le feed de notifications d'une autre personne en passant son ID dans la query.

**Fix :** Remplacer `{ where: { userId } }` par `{ where: { userId: context.user.id } }` et supprimer le param `userId` du schema.

---

### ✅ 3. Impersonation sur les Dislikes (4 resolvers)
**Fichiers :** `back/src/domain/dislike/mutation.ts` — fonctions `addArticleDislike`, `deleteArticleDislike`, `addCommentDislike`, `deleteCommentDislike`

```ts
async (_, { articleId, userId }, { dataSources: { db } }) => {
  // context.user pas utilisé — userId vient entièrement du client
  await db.dislike.create({ data: { articleId, userId } });
```

**Scénario :** N'importe qui peut dislike/undislike au nom de n'importe quel autre user. Notifications de harcèlement envoyées à tort, réputation faussée.

**Fix :** Remplacer `userId` par `context.user.id` dans les 4 resolvers. Supprimer le param `userId` du schema GraphQL.

---

### ✅ 4. Route `/api/push/unsubscribe` sans Authentification
**Fichier :** `back/src/index.ts:129-141`

```ts
app.post("/api/push/unsubscribe", async (req, res) => {
  const { endpoint } = req.body;
  // Aucun Bearer token requis
  await db.pushSubscription.deleteMany({ where: { endpoint } });
  return res.status(200).json({ success: true });
});
```

**Scénario :** Attaquant connaissant (ou devinant) l'endpoint push d'une victime peut la désabonner de toutes ses notifications sans aucune auth.

**Fix :** Vérifier JWT + ownership (`pushSubscription.userId === context.user.id`).

---

### ✅ 5. VAPID Private Key Hardcodée dans le Code Source
**Fichier :** `back/src/utils/sendPushNotification.ts:5-11`

```ts
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT! ?? "mailto:asocial.network.contact@gmail.com",
  process.env.VAPID_PUBLIC_KEY! ?? "BJaZF6hvnoVCh-...TM",
  process.env.VAPID_PRIVATE_KEY! ?? "hMvjU5EK3NvoWRWNGVnfHCYRVTE5LGNXc46MrhCG2HI" // ← secret en clair
);
```

**Scénario :** Clé privée VAPID présente dans le code source, dans l'image Docker, et dans tout clone du repo. Permet de signer des push notifications arbitraires vers tous les abonnés.

**Fix :** Supprimer le fallback hardcodé. Crash au démarrage si `VAPID_PRIVATE_KEY` absent — c'est voulu.

---

### 6. JWT 365 Jours, Pas de Révocation, Algorithm Non Pincé
**Fichier :** `back/src/module/auth.ts:6-13`

```ts
const token = jwt.sign(
  { id: user.id, username: user.username },
  process.env.JWT_SECRET as string,
  { expiresIn: "365d" } // 1 an
);

// Vérification sans pinning d'algorithm
jwt.verify(token, secret); // manque: { algorithms: ['HS256'] }
```

**Scénario :** Token volé (XSS, log leak, etc.) = 1 an d'accès non révocable. Sans blacklist ni `tokenVersion`, impossible d'expulser un attaquant.

**Fix :**
- `expiresIn: "7d"` + refresh silencieux côté front
- Ajouter colonne `tokenVersion: Int` sur `User`, incrémenter à chaque logout/reset
- `jwt.verify(token, secret, { algorithms: ['HS256'] })`

---

### ✅ 7. ImgBB API Key Exposée dans le Bundle JS Frontend
**Fichier :** `front/src/utils/imageUpload.tsx:1`

```ts
const API_KEY = "f0b08049fc173fd14f6483b221f9f9e9";
```

**Scénario :** Visible dans `view-source` ou les DevTools de n'importe quel visiteur. Permet d'abuser du quota ImgBB de l'application.

**Fix :** Proxy d'upload via le backend — le frontend envoie le fichier au backend, le backend upload sur ImgBB avec la clé côté serveur.

---

## MEDIUM

### ✅ 8. `dangerouslySetInnerHTML` avec Escape Insuffisant
**Fichiers :**
- `front/src/pages/publications/PublicationPage.tsx:795-802`
- `front/src/pages/publications/PublicationDetailsPage.tsx:243-250`
- `front/src/pages/profile/MyProfilePage.tsx:84`
- `front/src/pages/profile/UserProfilePage.tsx:59-66`

```ts
const escaped = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
// Escape < > mais PAS & " ' 
const withMentions = escaped.replace(
  /@([a-zA-Z0-9_.\-']+)(?=\s|$)/g,
  `<span class="mention" data-username="$1">@$1</span>`,
);
return { __html: withMentions }; // → dangerouslySetInnerHTML
```

**Scénario :** Actuellement limité par la regex username. Si un username invalide passe côté serveur (voir finding #9), ou si un attaquant casse la regex, le contenu non échappé entre dans le DOM directement.

**Fix :** Utiliser `DOMPurify.sanitize()` sur le résultat, ou rendre les mentions via composants React (`<span>@{username}</span>`) sans innerHTML.

---

### ✅ 9. Username Non Validé Côté Serveur
**Fichier :** `back/src/domain/user/createUser.ts`

Ajout validation regex `^[a-zA-Z0-9_.\-']+$` côté serveur. Même règle que le front. Password laissé sans contrainte (choix intentionnel DA). `updateUser` non modifié.

---

### ~~10. bcrypt Cost Factor = 5~~ — Ignoré (choix intentionnel)

---

### 11. `front/.env` Tracké dans Git
**Fichier :** `front/.env`

Contient Supabase anon key + Cloudinary cloud name/API key. Présent dans l'historique git.

**Fix :** Ajouter `front/.env` dans `.gitignore` racine. Rotater les clés. Injecter via variables d'environnement au build.

---

### ✅ 12. Validation des Uploads Uniquement Côté Client
**Fichiers :** `front/src/components/media/MediaUploader.tsx:29-40`, `back/src/domain/article/createArticle.ts:22-32`

```ts
// Front : checks navigateur uniquement
if (!file.type.startsWith("image/")) { alert(...); return; }
if (file.size > 8 * 1024 * 1024) { alert(...); return; }

// Back : accepte n'importe quelle URL sans validation
await db.article.create({ data: { imageUrl, videoUrl, ... } });
```

**Scénario :** Appel GraphQL direct → stockage d'URLs arbitraires (`javascript:`, trackers, domaines malveillants) en base.

**Fix :** Valider côté serveur que `imageUrl`/`videoUrl` matchent un domaine autorisé (allowlist : `res.cloudinary.com`, `i.ibb.co`, etc.).

---

### 13. Cloudinary Upload Preset Non Signé
**Fichier :** `front/src/utils/videoUpload.ts:11`

```ts
upload_preset: "asocial_videos" // unsigned preset
```

**Scénario :** N'importe qui peut uploader n'importe quel fichier directement sur le compte Cloudinary sans authentification.

**Fix :** Passer à un signed upload via le backend, ou configurer des restrictions strictes sur le preset Cloudinary (taille max, resource_type, allowed formats).

---

### ✅ 14. Socket.IO CORS `origin: "*"`
**Fichier :** `back/src/index.ts:54-59`

```ts
const io = new SocketIOServer(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});
```

**Fix :** Remplacer par la liste exacte des origines autorisées (ex: `["https://asocial.app"]`).

---

### ✅ 15. Pas de Rate Limiting
Aucun middleware de rate limiting sur :
- `signIn` → credential stuffing
- `createUser` → création de comptes en masse
- `requestPasswordReset` → flood de tokens / spam email

**Fix :** `express-rate-limit` sur les routes sensibles. `graphql-rate-limit` pour les mutations.

---

### ✅ 16 & 22. User Supprimé → Token Toujours Valide
**Fichier :** `back/src/module/auth.ts:20-35`

Le middleware `getUser` decode le JWT sans vérifier que l'utilisateur existe toujours en DB. Un user supprimé ou banni garde son accès pendant toute la durée du token.

**Fix :** Ajouter une lookup DB dans `getUser`, ou implémenter `tokenVersion` (voir finding #6).

---

### ✅ 17. `include: { user: true }` Ramène le Hash du Mot de Passe
**Fichier :** `back/src/domain/dislike/queries.ts:12-15, 30-33, 48-52, 66-71`

```ts
return db.dislike.findMany({
  where: { articleId },
  include: { user: true } // ramène TOUTES les colonnes User dont `password`
});
```

Prisma ramène le champ `password` (bcrypt hash). Le schema GraphQL ne l'expose pas, donc pas de fuite directe aujourd'hui — mais c'est une défense implicite fragile.

**Fix :** Utiliser `select` explicite :
```ts
include: {
  user: { select: { id: true, username: true, iconName: true } }
}
```

---

### ✅ 18. Email HTML sans Échappement du Username
**Fichier :** `back/src/utils/sendPasswordResetEmail.ts:27`

```ts
html: `... Hey <strong>${username}</strong>, ...`
```

Username non échappé dans le HTML de l'email. Si un username avec du HTML passe la validation serveur (voir finding #9), injection HTML dans l'email.

**Fix :** Échapper le username avant interpolation HTML.

---

## LOW

### ✅ 19. Pas de `helmet`, pas de CSP, pas de HTTPS enforcement
**Fichier :** `back/src/index.ts`

Aucun header de sécurité (`X-Frame-Options`, `X-Content-Type-Options`, `Content-Security-Policy`).

**Fix :** `app.use(helmet())` — protège contre clickjacking, MIME sniffing, etc.

---

### ✅ 20. `/api/auth/verify` Sans Lookup DB — Réglé via point 16 (`getUser` async + DB lookup)
**Fichier :** `back/src/index.ts:144-155`

```ts
res.status(200).json({ valid: true, user: payload }); // payload = données du JWT, pas de la DB
```

Retourne les claims du token sans vérifier que le user existe toujours.

---

### 21. Password Non Validé Côté Serveur
`createUser` / `updateUser` / `resetPasswordWithToken` acceptent un mot de passe vide ou d'un seul caractère.

**Fix :** Longueur minimum 8 caractères côté serveur.

---

### ✅ 22. Introspection GraphQL Activée en Production
**Fichier :** `back/src/index.ts:17-22`

Expose le schema complet aux attaquants pour cartographier les mutations et les types disponibles.

**Fix :** Désactiver en production avec `introspection: process.env.NODE_ENV !== 'production'`.

---

### ✅ 23. Console.log Extensif de Contenu Utilisateur
Exemples : `back/src/domain/article/createArticle.ts:95-102`, `findArticles.ts:22-27`, `updateArticle.ts:61`

Tout le contenu des articles/commentaires est loggué côté serveur. En plus, `notifyTelegram.ts` forward chaque création vers un chat Telegram — exfiltration involontaire vers un tiers si les credentials Telegram leakent.

---

### ✅ 24. `addComment` Déclare `userId: ID!` dans le Schema (Non Utilisé mais Dangereux) — Schema + front + codegen régénéré
**Fichier :** `back/src/schema.ts:50-55`

Le resolver corrige avec `context.user.id`, mais si quelqu'un refactorise en utilisant `args.userId` sans vérifier, c'est une impersonation immédiate.

**Fix :** Supprimer `userId` du schema `addComment`.

---

## Chaînes d'Attaque Prioritaires

| # | Attaque | Prérequis | Impact |
|---|---------|-----------|--------|
| 1 | `requestPasswordReset(username="victime", email="attacker@x.com")` | Aucun | Full account takeover |
| 2 | `addDislike(articleId, userId="victime")` | Être authentifié | Harcèlement, réputation faussée |
| 3 | `getNotifications(userId="victime")` | Être authentifié + connaître l'UUID | Lecture feed privé |
| 4 | `POST /api/push/unsubscribe { endpoint }` | Connaître l'endpoint | Désabonnement forcé |
| 5 | Clé service_role Supabase leakée | Accès au repo/env | Full DB read/write/drop |

---

## Roadmap de Corrections

### Urgent (cette semaine)
1. **Fix `requestPasswordReset`** — stocker email sur `User`, ne jamais accepter email du client
2. **Fix dislikes** — `userId: context.user.id` dans les 4 resolvers, supprimer param du schema
3. **Fix notifications** — `userId: context.user.id` dans `getNotifications`
4. **Auth sur `/api/push/unsubscribe`** — vérifier JWT + ownership
5. **Retirer VAPID private key** du code source, rotater immédiatement

### Court terme (ce mois)
6. **Rotater tous les secrets** — DB password, JWT_SECRET, Supabase service_role, ImgBB, Cloudinary
7. **JWT** — réduire à 7j, pincer algorithm, ajouter `tokenVersion`
8. **bcrypt cost** → 12
9. **Validation username/password** côté serveur
10. **DOMPurify** sur `highlightMentions` ou rendre les mentions via composants React

### Moyen terme
11. **Rate limiting** — `express-rate-limit` + `graphql-rate-limit`
12. **Cloudinary** → signed uploads via backend
13. **`helmet`** + CSP + restriction CORS Socket.IO
14. **`select` explicite** sur toutes les includes Prisma qui touchent `User`
15. **Allowlist `imageUrl`/`videoUrl`** côté serveur
16. **Désactiver introspection GraphQL** en production
17. **`front/.env`** → retirer du git, injecter via CI/CD
