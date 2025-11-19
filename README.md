# Aistos Debt Payment Application

Application web de gestion et paiement de dettes avec intégration Stripe.

## Démarrage

### Prérequis

- **Bun** (v1.3.2+) - Runtime JavaScript/TypeScript
- **Docker Desktop** - Pour la base de données PostgreSQL
- **Node.js** (v18+) - Pour la compatibilité Next.js (optionnel si Bun est installé)
- **Stripe Account** - Compte de test Stripe

### Installation

1. **Cloner le dépôt** (si applicable) ou naviguer vers le dossier du projet

2. **Installer les dépendances** :
   ```bash
   bun install
   ```

3. **Configurer les variables d'environnement** :
   ```bash
   cp .env.example .env
   ```
   
   Puis éditer `.env` avec vos valeurs :
   ```env
   # Database
   DATABASE_URL="postgresql://aistos_user:aistos_password@localhost:5432/aistos_debt?schema=public"

   # Stripe
   STRIPE_SECRET_KEY="sk_test_..."
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."

   # Next.js
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. **Démarrer la base de données PostgreSQL** :
   ```bash
   bun run db:up
   # ou
   docker-compose up -d
   ```

5. **Configurer Prisma et créer la base de données** :
   ```bash
   bun run prisma:generate
   bun run prisma:migrate
   ```

6. **Importer les données CSV** :
   ```bash
   # Via l'API (une fois le serveur démarré)
   curl -X POST http://localhost:3000/api/debts/import \
     -H "Content-Type: application/json" \
     -d '{"filePath": "./file.csv"}'
   ```

### Lancer le projet

**Option 1: Script automatique (recommandé)** :
```bash
./startwithdocker.sh
```

Ce script va :
- Vérifier que Docker est en cours d'exécution
- Démarrer la base de données PostgreSQL
- Configurer Prisma (génération du client et migrations)
- Démarrer l'application Next.js

**Option 2: Mode développement manuel** :
```bash
# 1. Démarrer la base de données
docker-compose up -d

# 2. Générer le client Prisma
bun run prisma:generate

# 3. Lancer les migrations
bun run prisma:migrate

# 4. Démarrer l'application
bun run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

**Mode production** :
```bash
bun run build
bun run start
```

### Tester l'application

#### Tests E2E avec Cypress

1. **Démarrer l'application** :
   ```bash
   bun run dev
   ```

2. **Dans un autre terminal, lancer les tests** :
   ```bash
   # Mode interactif
   bun run test:e2e:open
   
   # Mode headless
   bun run test:e2e
   ```

#### Tests manuels

1. **Importer les dettes** :
   - Accéder à `/api/debts/import` via POST avec `{"filePath": "./file.csv"}`
   - Ou utiliser l'interface si disponible

2. **Rechercher une dette** :
   - Aller sur `/debtor`
   - Entrer un email (ex: `jeremy@aistos.fr`)
   - Vérifier l'affichage des informations

3. **Tester un paiement Stripe** :
   - Sur la page d'une dette en attente, cliquer sur "Payer maintenant"
   - Utiliser une carte de test Stripe :
     - **Carte réussie** : `4242 4242 4242 4242`
     - **Carte refusée** : `4000 0000 0000 0002`
     - **Date d'expiration** : N'importe quelle date future
     - **CVC** : N'importe quel 3 chiffres
     - **Code postal** : N'importe quel code postal valide

4. **Vérifier la mise à jour du statut** :
   - Après le paiement, retourner sur la page du débiteur
   - Le statut devrait être mis à jour à "Payé"
   - Un toast de confirmation devrait apparaître

## Choix d'architecture

### Framework : Next.js 14 avec App Router

**Raison** :
- **Full-stack** : Permet de gérer frontend et backend dans un seul projet
- **API Routes** : Intégration native pour les endpoints API
- **Server Components** : Performance optimale avec React Server Components
- **TypeScript natif** : Support TypeScript intégré
- **Écosystème mature** : Large communauté et documentation

**App Router vs Pages Router** :
- Utilisation de l'App Router (Next.js 13+) pour une meilleure organisation et performance

### Runtime : Bun

**Raison** :
- **Performance** : Exécution plus rapide que Node.js
- **Compatibilité** : Compatible avec l'écosystème npm
- **Built-in tools** : Gestionnaire de paquets, bundler, test runner intégrés
- **TypeScript natif** : Support TypeScript sans compilation

### Base de données : PostgreSQL avec Prisma

**Raison** :
- **PostgreSQL** :
  - Base de données relationnelle robuste et fiable
  - Support des transactions ACID
  - Excellent pour les données structurées
  - Docker pour faciliter le déploiement

- **Prisma** :
  - Type-safety avec TypeScript
  - Migrations automatiques
  - Client généré optimisé
  - Excellent DX (Developer Experience)
  - Prisma Studio pour visualisation des données

### UI : TailwindCSS + Shadcn/ui

**Raison** :
- **TailwindCSS** :
  - Utility-first CSS, développement rapide
  - Personnalisation facile
  - Optimisation automatique en production

- **Shadcn/ui** :
  - Composants accessibles (Radix UI)
  - Personnalisables et copiables (pas de dépendance)
  - Style "New York" moderne
  - Compatible avec TailwindCSS

### Paiement : Stripe

**Raison** :
- **Leader du marché** : Solution de paiement la plus utilisée
- **Mode test** : Environnement de test complet
- **Webhooks** : Notifications en temps réel des paiements
- **Checkout** : Solution hébergée, sécurisée et optimisée
- **Documentation excellente** : Support et exemples nombreux

### Architecture des API

**REST API** :
- Routes API Next.js (`/app/api/*`)
- Endpoints RESTful standards
- JSON pour les réponses

**Webhooks** :
- Endpoint dédié pour Stripe (`/api/webhooks/stripe`)
- Vérification de signature pour la sécurité
- Mise à jour automatique du statut

### Hypothèses et décisions

1. **Un email = une dette** : Chaque email est unique dans la base de données
2. **Statut binaire** : PENDING ou PAID (pas de statuts intermédiaires)
3. **Montants en euros** : Tous les montants sont en EUR
4. **CSV en entrée** : Format fixe avec colonnes spécifiques
5. **Mode test Stripe** : Utilisation exclusive du mode test pour le développement

### Limitations connues

1. **Webhooks locaux** : Nécessite un tunnel (ngrok, Stripe CLI) pour tester les webhooks en local
2. **Pas d'authentification** : L'application est accessible publiquement (à ajouter en production)
3. **Pas de gestion multi-devises** : Support uniquement EUR
4. **Polling pour les mises à jour** : Utilisation de polling au lieu de WebSocket (acceptable pour ce cas d'usage)
5. **Pas de pagination** : Si beaucoup de dettes, l'affichage pourrait être limité
6. **Validation côté client** : Validation basique, pourrait être renforcée

## Avant une mise en production

### Sécurité

1. **Authentification et autorisation** :
   - Implémenter un système d'authentification (NextAuth.js, Clerk, etc.)
   - Protéger les routes API sensibles
   - Vérifier les permissions avant les opérations

2. **Validation des entrées** :
   - Renforcer la validation côté serveur
   - Sanitization des données utilisateur
   - Protection CSRF pour les formulaires

3. **Secrets et variables d'environnement** :
   - Utiliser un gestionnaire de secrets (Vault, AWS Secrets Manager)
   - Ne jamais commiter les clés API
   - Rotation régulière des clés

4. **HTTPS obligatoire** :
   - Certificats SSL/TLS
   - Redirection HTTP → HTTPS
   - HSTS headers

5. **Rate limiting** :
   - Limiter les requêtes API par IP
   - Protection contre les attaques DDoS
   - Limitation des tentatives de paiement

6. **Webhook security** :
   - Vérification stricte des signatures Stripe
   - Validation de l'origine des webhooks
   - Logging des tentatives suspectes

### Performance

1. **Optimisation des requêtes** :
   - Mise en cache des requêtes fréquentes (Redis)
   - Indexation optimale de la base de données
   - Pagination pour les listes

2. **Optimisation frontend** :
   - Code splitting automatique (Next.js)
   - Images optimisées (next/image)
   - Lazy loading des composants

3. **CDN** :
   - Utiliser un CDN pour les assets statiques
   - Mise en cache des pages statiques

4. **Base de données** :
   - Connection pooling (Prisma le gère déjà)
   - Requêtes optimisées
   - Monitoring des requêtes lentes

### Monitoring et logging

1. **Logging structuré** :
   - Implémenter un service de logging (Winston, Pino)
   - Logs structurés (JSON)
   - Niveaux de log appropriés (error, warn, info, debug)

2. **Monitoring d'application** :
   - APM (Application Performance Monitoring) : Sentry, Datadog, New Relic
   - Alertes sur les erreurs critiques
   - Dashboard de métriques

3. **Monitoring de la base de données** :
   - Surveillance des performances PostgreSQL
   - Alertes sur les connexions élevées
   - Backup automatique

4. **Monitoring Stripe** :
   - Surveillance des webhooks
   - Alertes sur les échecs de paiement
   - Dashboard Stripe pour les métriques

### Gestion des erreurs

1. **Error boundaries** :
   - Implémenter des error boundaries React
   - Pages d'erreur personnalisées
   - Fallback UI pour les erreurs

2. **Gestion des erreurs API** :
   - Messages d'erreur cohérents
   - Codes d'erreur HTTP appropriés
   - Logging des erreurs avec contexte

3. **Retry logic** :
   - Retry automatique pour les requêtes échouées
   - Exponential backoff
   - Circuit breaker pattern

### Stratégie de tests

1. **Tests unitaires** :
   - Tests des utilitaires (CSV parser, validators)
   - Tests des composants React isolés
   - Coverage > 80%

2. **Tests d'intégration** :
   - Tests des API routes
   - Tests de la base de données
   - Tests des intégrations Stripe

3. **Tests E2E** :
   - Cypress pour les tests end-to-end
   - Tests des flux critiques
   - Tests de régression

4. **Tests de charge** :
   - Tests de performance
   - Tests de stress
   - Optimisation basée sur les résultats

### Autres améliorations

1. **CI/CD** :
   - Pipeline d'intégration continue
   - Tests automatiques avant déploiement
   - Déploiement automatique (Vercel, Railway, etc.)

2. **Documentation API** :
   - OpenAPI/Swagger pour la documentation API
   - Exemples de requêtes
   - Documentation des webhooks

3. **Internationalisation** :
   - Support multi-langues (i18n)
   - Formatage des dates/montants selon la locale

4. **Accessibilité** :
   - Conformité WCAG 2.1
   - Tests d'accessibilité automatisés
   - Support clavier complet

5. **Analytics** :
   - Tracking des événements utilisateur
   - Analytics de conversion
   - A/B testing

## Ressources utilisées

### Documentation

- **Next.js** : https://nextjs.org/docs
- **Bun** : https://bun.sh/docs
- **Prisma** : https://www.prisma.io/docs
- **Stripe** : 
  - Documentation API : https://stripe.com/docs/api
  - Webhooks : https://stripe.com/docs/webhooks
  - Checkout : https://stripe.com/docs/payments/checkout
- **TailwindCSS** : https://tailwindcss.com/docs
- **Shadcn/ui** : https://ui.shadcn.com
- **Cypress** : https://docs.cypress.io
- **TypeScript** : https://www.typescriptlang.org/docs

### Outils

- **Cursor** : Éditeur de code avec IA
- **Docker** : Containerisation de la base de données
- **Git** : Contrôle de version
- **Prisma Studio** : Interface graphique pour la base de données
- **Stripe CLI** : Outil en ligne de commande pour tester les webhooks

### Assistants IA

- **Cursor** : Principalement utilisé pour le développement
- **ChatGPT** : Utilisé pour la résolution de problèmes et la recherche

### Packages npm principaux

- `next` : Framework React full-stack
- `react` & `react-dom` : Bibliothèque UI
- `typescript` : Typage statique
- `prisma` & `@prisma/client` : ORM et client de base de données
- `stripe` & `@stripe/stripe-js` : SDK Stripe
- `zod` : Validation de schémas
- `papaparse` : Parsing CSV
- `tailwindcss` : Framework CSS
- `@radix-ui/*` : Composants UI accessibles
- `cypress` : Framework de tests E2E
- `clsx` & `tailwind-merge` : Utilitaires CSS

## Structure du projet

```
aistos/
├── app/                    # Next.js App Router
│   ├── api/               # Routes API
│   │   ├── debts/         # API des dettes
│   │   ├── payments/      # API des paiements
│   │   └── webhooks/      # Webhooks Stripe
│   ├── debtor/            # Pages débiteur
│   ├── payment/           # Pages de paiement
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Page d'accueil
├── components/            # Composants React
│   └── ui/               # Composants Shadcn/ui
├── lib/                   # Utilitaires et configurations
│   ├── prisma.ts          # Client Prisma
│   ├── stripe.ts          # Client Stripe
│   ├── csv-parser.ts      # Parser CSV
│   └── utils.ts           # Utilitaires généraux
├── prisma/                # Prisma
│   └── schema.prisma      # Schéma de base de données
├── cypress/               # Tests E2E
│   ├── e2e/              # Tests end-to-end
│   └── support/          # Support Cypress
├── public/                # Assets statiques
├── docker-compose.yml     # Configuration Docker
├── file.csv               # Fichier CSV d'exemple
└── README.md              # Ce fichier
```

## Commandes utiles

```bash
# Développement
bun run dev              # Démarrer le serveur de développement
bun run build            # Build de production
bun run start            # Démarrer le serveur de production

# Base de données
bun run db:up            # Démarrer PostgreSQL
bun run db:down          # Arrêter PostgreSQL
bun run db:logs          # Voir les logs
bun run db:reset         # Réinitialiser la base de données

# Prisma
bun run prisma:generate  # Générer le client Prisma
bun run prisma:migrate   # Exécuter les migrations
bun run prisma:studio    # Ouvrir Prisma Studio

# Tests
bun run test:e2e         # Lancer les tests Cypress (headless)
bun run test:e2e:open    # Ouvrir Cypress Test Runner
bun run test:e2e:headed  # Lancer les tests en mode headed

# Autres
bun run lint             # Linter le code
bun run type-check       # Vérifier les types TypeScript
```

## Support

Pour toute question ou problème, contactez : thibault@aistos.fr

