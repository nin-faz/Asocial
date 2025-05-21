# Asocial

## FAZER Nino - PEREIRA-ELENGA MAKOUALA Jordy - TRAN Huu-Nghia - MONMARCHE Romain

## Description du Projet

Asocial est un réseau social moderne développé comme projet éducatif qui démontre l'implémentation d'une stack GraphQL complète. L'application permet aux utilisateurs de :

- S'inscrire et se connecter avec un système d'authentification sécurisé
- Publier, modifier et supprimer des articles
- Commenter les publications d'autres utilisateurs
- "Disliker" des articles et des commentaires
- Accéder à un profil utilisateur personnalisé avec bio et icône

Ce projet illustre l'architecture d'une application full-stack utilisant **GraphQL, Prisma, Apollo Server et Apollo Client**, en mettant en œuvre les meilleures pratiques de développement moderne.

---

## Fonctionnalités Clés

### 1. Authentification des Utilisateurs :closed_lock_with_key:

- Système complet d'inscription et connexion avec validation
- Gestion des sessions utilisateur avec JWT
- Profil utilisateur personnalisable (bio, nom d'utilisateur, icône)

### 2. Gestion des Articles :pencil:

- **CRUD complet** : création, lecture, mise à jour et suppression d'articles
- Support pour les images via URL
- Affichage des articles avec auteur, contenu, commentaires et dislikes
- Horodatage des articles (création et mise à jour)

### 3. Interaction Sociale :star:

- Système de commentaires sur les articles
- Mécanisme de dislikes pour les articles et commentaires
- Compteurs de dislikes et commentaires en temps réel

### 4. Interface Utilisateur et Navigation :mag:

- Page principale affichant les articles récents
- Page de détail pour chaque publication
- Page de profil utilisateur
- Filtrage des articles par unpopularité (nombre de dislikes)

### 5. Performance et Sécurité :shield:

- Validation des entrées côté client et serveur
- Protection des routes avec authentification
- Gestion élégante des erreurs avec feedback utilisateur

---

## Technologies Utilisées :computer:

### Backend

- **TypeScript** - Typage statique pour une meilleure maintenabilité
- **Apollo Server** - Serveur GraphQL
- **Prisma ORM** - Modélisation de données typée et migrations
- **GraphQL Codegen** - Génération automatique des types et resolvers
- **JWT** - Gestion sécurisée de l'authentification
- **SQLite** - Base de données relationnelle légère
- **bcrypt** - Hachage sécurisé des mots de passe

### Frontend

- **React 19** - Bibliothèque UI avec Hooks et architecture moderne
- **Apollo Client** - Gestion d'état et cache pour GraphQL
- **TailwindCSS** - Styling utilitaire et responsive
- **React Router v7** - Navigation et routes protégées
- **React Toastify** - Système de notifications élégant
- **Framer Motion** - Animations fluides
- **Lucide React** - Icônes modernes
- **date-fns** - Formatage des dates

---

## Structure du Projet

```
Asocial/
├── back/                 # Backend GraphQL avec Apollo Server
│   ├── prisma/           # Schéma et migrations Prisma
│   ├── src/
│   │   ├── resolvers.ts  # Resolvers GraphQL
│   │   ├── schema.ts     # Définition du schéma GraphQL
│   │   └── index.ts      # Point d'entrée du serveur
│   └── package.json
│
├── front/                # Frontend React avec Apollo Client
│   ├── public/           # Assets statiques
│   ├── src/
│   │   ├── components/   # Composants React réutilisables
│   │   ├── pages/        # Pages principales de l'application
│   │   ├── mutations/    # Mutations GraphQL
│   │   ├── queries/      # Requêtes GraphQL
│   │   └── App.tsx       # Composant racine
│   └── package.json
│
└── README.md             # Documentation principale
```

---

## Prérequis

Avant d'installer et d'exécuter le projet, assurez-vous d'avoir :

- **Node.js** installé (v18 ou supérieur)
- **Un gestionnaire de paquets** comme npm ou yarn

---

## Installation et Lancement du Projet

### Clonez le dépôt

```sh
git clone https://github.com/RoromainM/Asocial.git
cd Asocial
```

### Backend

```sh
cd back

# Installer les dépendances
npm install

# Récupérer la dernière structure de la BD
npm run prisma migrate dev --name init

# Générer les types
npm run codegen

# Lancer le back
npm run dev

# Lancer Prisma Studio pour visualiser/éditer la BD
npm run prisma studio
```

### Configuration du .env

![alt env](image.png)

### Frontend

```sh
cd front

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

Ouvrez l'application dans votre navigateur à l'adresse :

```
http://localhost:5173
```

---

## API GraphQL

Le backend expose un endpoint GraphQL avec les opérations suivantes :

### Requêtes principales :

- `findUserById` : Informations sur un utilisateur spécifique
- `findArticles` : Liste des articles
- `findArticleById` : Détails d'un article spécifique
- `findArticleByMostDisliked` : Articles les plus dislikés
- `getComments` : Commentaires d'un article

### Mutations principales :

- `createUser` : Création d'un compte utilisateur
- `signIn` : Authentification et génération de token
- `updateUser` : Modification du profil utilisateur
- `createArticle` : Publication d'un nouvel article
- `updateArticle` : Modification d'un article existant
- `deleteArticle` : Suppression d'un article
- `addComment` : Ajout d'un commentaire
- `updateComment` : Modification d'un commentaire
- `deleteComment` : Suppression d'un commentaire
- `addArticleDislike` : Dislike d'un article
- `addCommentDislike` : Dislike d'un commentaire

---

## Livrables :package:

- **Un monorepo GitHub** avec :
  - Un dossier `back/` contenant le backend
  - Un dossier `front/` contenant le frontend
  - Un `README.md` détaillé pour chaque partie
- Une **présentation finale** du projet

---

Bonne exploration ! :rocket:
