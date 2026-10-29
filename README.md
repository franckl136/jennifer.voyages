# Jennifer & Voyages

Site vitrine Next.js pour une voyage planner : services, blog Notion, formulaire de contact.

## Stack

- Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS 4
- Notion CMS (`@notionhq/client`) pour le blog
- Déploiement prévu : Vercel

## Démarrage

```bash
cp .env.example .env.local
# Renseigner NOTION_TOKEN, NOTION_DATABASE_ID, NEXT_PUBLIC_WHATSAPP_E164…
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Variables d’environnement

Voir `.env.example` :

| Variable | Rôle |
|----------|------|
| `NOTION_TOKEN` | Intégration Notion |
| `NOTION_DATABASE_ID` | Base « Blog » |
| `NOTION_DATA_SOURCE_ID` | Optionnel (API data sources) |
| `NEXT_PUBLIC_WHATSAPP_E164` | Numéro WhatsApp (E.164 sans `+`) |
| `NEXT_PUBLIC_SITE_URL` | URL publique (SEO / sitemap) |
| `RESEND_API_KEY` | Clé API Resend (formulaire contact) |
| `CONTACT_TO_EMAIL` | Destinataire des messages |
| `CONTACT_FROM_EMAIL` | Expéditeur sur `jennifervoyages.fr` (domaine vérifié dans Resend) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Clé site Cloudflare Turnstile (publique) |
| `TURNSTILE_SECRET_KEY` | Clé secrète Turnstile (serveur uniquement) |
| `TURNSTILE_ALLOWED_HOSTNAMES` | Noms d’hôte supplémentaires autorisés pour le jeton |
| `KV_REST_API_URL` / `UPSTASH_REDIS_REST_URL` | URL Redis Upstash (l’intégration Vercel crée les noms `KV_*`) |
| `KV_REST_API_TOKEN` / `UPSTASH_REDIS_REST_TOKEN` | Jeton Redis, serveur uniquement |
| `CONTACT_RATE_LIMIT_SALT` | Sel optionnel des empreintes de limitation |
| `REVALIDATE_SECRET` | Secret pour `POST /api/revalidate` (cache blog) |

Vérifier Notion : `npm run check-notion`.

## Pages

- `/` — Accueil (hero, services, blog, contact)
- `/blog/[slug]` — Article Notion
- `/mentions-legales` — Mentions, RGPD, CGU

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement (Turbopack) |
| `npm run build` | Build production |
| `npm run start` | Serveur production |
| `npm run lint` | ESLint |
| `npm test` | Tests du formulaire de contact |
| `npm run check-notion` | Diagnostic connexion Notion |
