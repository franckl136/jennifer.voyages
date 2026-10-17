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
| `CONTACT_FROM_EMAIL` | Expéditeur Resend (domaine vérifié) |
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
| `npm run check-notion` | Diagnostic connexion Notion |
