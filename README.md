# Asocial

## FAZER Nino - PEREIRA-ELENGA MAKOUALA Jordy - TRAN Huu-Nghia - MONMARCHE Romain

## 🚀 Démo en ligne
- **Frontend**: https://asocial-network.netlify.app
- **API GraphQL**: https://asocial-backend-3fc3.run.app/graphql

---

## Description du Projet

Asocial est un réseau social moderne qui permet aux utilisateurs de :

- S'inscrire et se connecter avec un système d'authentification sécurisé (JWT)
- Publier, modifier et supprimer des articles (texte, image, vidéo)
- Commenter les publications et répondre aux commentaires
- "Disliker" des articles et des commentaires
- Accéder à un profil utilisateur personnalisé avec bio et icône
- Recevoir des notifications en temps réel (Socket.IO + Web Push)
- **Créer des bulles de session** - Salons de discussion temporaires et anonymes pour débattre en direct
- ~~Consulter un leaderboard des utilisateurs les plus impopulaires~~ *(désactivé temporairement)*

---

## 🫧 Bulles de Session (Bubbles)

Les **Bubbles** sont des salons de discussion créés dynamiquement pour des conversations éphémères :

- **Création rapide** : Créer une nouvelle bulle en 1 clic
- **Anonymat optionnel** : Participer avec ou sans révéler son identité
- **Messages en temps réel** : Socket.IO pour les updates instantanées
- **Auto-destruction** : Les bulles disparaissent après la session
- **Liberté d'expression** : Espace dédié pour débattre sans jugement

### Mutations Bubble
- `createBubble(title, isAnonymous)` - Créer une nouvelle bulle
- `addMessageToBubble(bubbleId, content, isAnonymous)` - Poster un message
- `deleteBubble(id)` - Supprimer une bulle

### Queries Bubble
- `getBubbles(limit, offset)` - Lister les bulles actives
- `getBubbleById(id)` - Détail d'une bulle
- `getBubbleMessages(bubbleId)` - Messages d'une bulle

---

## Technologies Utilisées

### Backend
- **TypeScript** + **Node.js**
- **Apollo Server** — Serveur GraphQL
- **Prisma ORM** — Modélisation de données et migrations
- **PostgreSQL** (Supabase) — Base de données
- **Socket.IO** — Notifications temps réel + Bubbles
- **JWT** + **bcrypt** — Authentification sécurisée
- **GraphQL Codegen** — Génération automatique des types
- **Nodemailer** — Envoi d'emails (reset mot de passe)
- **Web Push** — Notifications push navigateur

### Frontend
- **React 19** + **TypeScript**
- **Apollo Client** — Gestion d'état et cache GraphQL
- **TailwindCSS** — Styling
- **React Router v7** — Navigation
- **Framer Motion** — Animations
- **Cloudinary** — Upload et stockage des vidéos
- **ImgBB** — Stockage des images uploadées

### Hébergement
- **Frontend** → Netlify (`https://asocial-network.netlify.app`)
- **Backend** → Google Cloud Run (Docker)
- **Base de données** → Supabase PostgreSQL
- **Storage images** → ImgBB (i.ibb)
- **Upload vidéos** → Cloudinary

---

## Structure du Projet

```
Asocial/
├── back/
│   ├── prisma/
│   │   ├── schema.prisma       # Schéma de la base de données
│   │   └── migrations/         # Historique des migrations
│   ├── src/
│   │   ├── domain/             # Resolvers par domaine (article, user, comment, bubble...)
│   │   ├── module/             # Auth (JWT, bcrypt)
│   │   ├── utils/              # Helpers (push, email, supabase...)
│   │   ├── datasource/db.ts    # Client Prisma
│   │   ├── resolvers.ts        # Assemblage des resolvers
│   │   ├── schema.ts           # Schéma GraphQL
│   │   └── index.ts            # Point d'entrée du serveur
│   ├── Dockerfile
│   └── package.json
│
├── front/
│   ├── src/
│   │   ├── components/         # Composants réutilisables
│   │   ├── pages/              # Pages de l'application
│   │   ├── queries/            # Requêtes GraphQL
│   │   ├── mutations/          # Mutations GraphQL
│   │   ├── context/            # Contextes React (Auth, Search...)
│   │   ├── gql/                # Types générés par codegen
│   │   └── App.tsx
│   ├── codegen.ts              # Config GraphQL Codegen (pointe sur localhost:4000)
│   └── package.json
│
└── README.md
```

---

## Prérequis

- **Node.js** v18 ou supérieur
- **npm**
- Un projet **Supabase** avec une base PostgreSQL active

---

## Variables d'environnement

### Backend (`back/.env`)

```env
# Base de données Supabase
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-x-eu-west-x.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-x-eu-west-x.pooler.supabase.com:5432/postgres"

# Auth
JWT_SECRET="votre_secret_jwt"

# Supabase Storage
SUPABASE_STORAGE_URL="https://[ref].supabase.co/storage/v1/s3"
SUPABASE_SERVICE_ROLE_KEY="votre_service_role_key"

# Web Push (générer avec web-push generate-vapid-keys)
VAPID_PUBLIC_KEY="votre_vapid_public_key"
VAPID_PRIVATE_KEY="votre_vapid_private_key"
VAPID_SUBJECT="mailto:votre@email.com"

# Email (reset mot de passe)
SMTP_USER="votre@gmail.com"
SMTP_PASS="votre_app_password"

# Telegram (optionnel)
TELEGRAM_BOT_TOKEN="votre_token"
TELEGRAM_CHAT_ID="votre_chat_id"
```

### Frontend (`front/.env`)

```env
# En local
VITE_GRAPHQL_URL=http://localhost:4000/graphql
VITE_API_URL=http://localhost:4000

# En production (pointer vers Cloud Run)
VITE_GRAPHQL_URL=https://asocial-backend-3fc3.run.app/graphql
VITE_API_URL=https://asocial-backend-3fc3.run.app

# Supabase Storage
VITE_SUPABASE_URL=https://[ref].supabase.co
VITE_SUPABASE_ANON_KEY=votre_anon_key

# Cloudinary (upload videos)
VITE_CLOUDINARY_CLOUD_NAME=votre_cloud_name
VITE_CLOUDINARY_API_KEY=votre_api_key
```

> Les URLs Supabase se trouvent dans **Settings → API** de ton projet Supabase.
> Les connection strings se trouvent dans **Settings → Database → Connect**.

---

## Lancement en local

### 1. Backend

```sh
cd back

# Installer les dépendances
npm install

# Appliquer les migrations sur la base de données
npx prisma migrate deploy

# Générer le client Prisma
npx prisma generate

# Générer les types GraphQL TypeScript
npm run codegen

# Lancer le serveur de développement (port 4000)
npm run dev
```

Le serveur démarre sur `http://localhost:4000/graphql`

```sh
# Visualiser / éditer la base de données
npx prisma studio
```

### 2. Frontend

```sh
cd front

# Installer les dépendances
npm install

# Lancer le serveur de développement (port 5173)
npm run dev
```

Ouvrir `http://localhost:5173`

> **Important** : le backend doit tourner avant de lancer le frontend.

---

## 📋 Scripts disponibles

### Backend
```sh
npm run dev      # Démarrer mode développement (localhost:4000)
npm run build    # Builder pour production
npm run codegen  # Regénérer types GraphQL + Prisma
npm run lint     # Vérifier le code (TypeScript)
```

### Frontend
```sh
npm run dev      # Démarrer mode développement (localhost:5173)
npm run build    # Builder pour production (dist/)
npm run codegen  # Regénérer types GraphQL (⚠️ backend doit tourner)
npm run preview  # Preview du build production
```

---

### Régénérer les types GraphQL (codegen)

À faire après toute modification du schéma GraphQL (`back/src/schema.ts`).

**1. Backend** (génère les types TypeScript côté serveur) :
```sh
cd back
npm run codegen
```

**2. Frontend** (génère les types TypeScript côté client) :
```sh
# ⚠️ Le backend doit impérativement tourner sur le port 4000
cd front
npm run codegen
```

> **Note** : le `codegen.ts` du frontend pointe sur `http://127.0.0.1:4000/graphql` (et non `localhost`) pour éviter les conflits IPv6 sur macOS.

---

## Déploiement

### Mettre à jour le schéma GraphQL (codegen)

Après toute modification du schéma GraphQL (`back/src/schema.ts`), il faut regénérer les types des deux côtés :

```sh
# Backend
cd back && npm run codegen

# Frontend (le backend doit tourner sur localhost:4000)
cd front && npm run codegen
```

### Déployer le backend sur Cloud Run

```sh
cd back

# Builder l'image Docker
docker build -t asocial-back .

# Tagger et pousser vers Google Container Registry (ou Artifact Registry)
docker tag asocial-back gcr.io/[PROJECT_ID]/asocial-back
docker push gcr.io/[PROJECT_ID]/asocial-back

# Déployer sur Cloud Run (ou depuis la console Google Cloud)
gcloud run deploy asocial-back \
  --image gcr.io/[PROJECT_ID]/asocial-back \
  --region europe-west1 \
  --platform managed
```

Après chaque déploiement, penser à vérifier les **variables d'environnement** dans Cloud Run → Edit & Deploy new revision → Variables & Secrets.

### Déployer le frontend sur Netlify

Le frontend se déploie automatiquement via **GitHub** dès qu'un commit est poussé sur `main`.

Pour un déploiement manuel :
```sh
cd front
npm run build
# Le dossier dist/ est prêt à être uploadé
```

Les variables d'environnement Netlify se configurent dans **Site configuration → Environment variables**.

---

## Migrations de base de données

```sh
cd back

# Créer une nouvelle migration après modification de schema.prisma
npx prisma migrate dev --name nom_de_la_migration

# Appliquer les migrations en production (sans créer de nouveau fichier)
npx prisma migrate deploy

# Réinitialiser complètement la base (ATTENTION : supprime toutes les données)
npx prisma migrate reset
```

---

## API GraphQL

Le backend expose un endpoint GraphQL sur `/graphql`.

### Requêtes

| Query | Description |
|---|---|
| `findArticles(limit, offset)` | Articles paginés, triés par date |
| `findArticleById(id)` | Détail d'un article |
| `findArticleByMostDisliked(limit, offset)` | Articles les plus dislikés, paginés |
| `findArticlesByUser(userId)` | Articles d'un utilisateur |
| `findUserById(id)` | Profil d'un utilisateur |
| `findAllUsers` | Tous les utilisateurs avec stats |
| `searchUsers(query)` | Recherche d'utilisateurs par nom (max 10) |
| `getComments(articleId)` | Commentaires d'un article |
| `getNotifications(userId, limit, offset)` | Notifications d'un utilisateur |
| `getBubbles(limit, offset)` | Bulles de session actives |
| `getBubbleById(id)` | Détail d'une bulle |
| `getBubbleMessages(bubbleId)` | Messages d'une bulle |

### Mutations

| Mutation | Description |
|---|---|
| `createUser(username, password)` | Inscription |
| `signIn(username, password)` | Connexion |
| `updateUser(id, body)` | Mise à jour du profil |
| `createArticle(title, content, imageUrl, videoUrl)` | Créer un article |
| `updateArticle(id, ...)` | Modifier un article |
| `deleteArticle(id)` | Supprimer un article |
| `addComment(content, userId, articleId, parentId)` | Ajouter un commentaire |
| `updateComment(commentId, content)` | Modifier un commentaire |
| `deleteComment(commentId)` | Supprimer un commentaire |
| `addArticleDislike(articleId, userId)` | Disliker un article |
| `deleteArticleDislike(articleId, userId)` | Retirer un dislike |
| `addCommentDislike(commentId, userId)` | Disliker un commentaire |
| `requestPasswordReset(email, username)` | Demander un reset de mot de passe |
| `resetPasswordWithToken(token, username, newPassword)` | Réinitialiser le mot de passe |
| `markNotificationsAsRead(ids)` | Marquer des notifications comme lues |
| `createBubble(title, isAnonymous)` | Créer une bulle de session |
| `addMessageToBubble(bubbleId, content, isAnonymous)` | Poster un message dans une bulle |
| `deleteBubble(id)` | Supprimer une bulle |

---

Bonne exploration ! 🚀
