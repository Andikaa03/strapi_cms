# Strapi CMS Backend

## Local Development

```bash
npm install
npm run develop
```

## Production Environment

Create `.env` from `.env.example` and set at minimum:

- `HOST`, `PORT`, `PUBLIC_URL`
- `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `JWT_SECRET`, `ENCRYPTION_KEY`
- Database settings (`DATABASE_CLIENT=postgres`, host/port/name/user/password)
- AWS/S3 and SES credentials if media/email features are enabled
- `CLOUDFLARE_TURNSTILE_SECRET_KEY` (real key in production)

## Production Build and Start

```bash
npm ci
npm run build
npm run start
```

## Docker (Production)

```bash
docker build -t shottyodhara-strapi .
docker run --rm -p 1337:1337 \
	--env-file .env \
	shottyodhara-strapi
```

Notes:

- Use PostgreSQL for production (not sqlite).
- Ensure persistent storage is configured for uploads if using local provider.
