This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Database setup

After setting `DATABASE_URL`, create or update the schema and seed the default transaction categories:

```bash
npm run db:push
npm run db:seed
```

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Authentication setup

DreamPaisa requires a verified Supabase email before users can view or change financial data.

1. Copy `.env.example` to `.env` and provide the Supabase and database values.
2. In Supabase Auth, enable **Confirm email**.
3. In Supabase Auth URL configuration, add `http://localhost:3000/auth/callback` for local development and your production `/auth/callback` URL as an allowed redirect.
4. Set `NEXT_PUBLIC_SITE_URL` to the public URL of the deployed app.

## Account deletion retention

Account deletion requires a new email verification link and that link is accepted for only 10 minutes. Confirmed deletion hides all finance data immediately and keeps it recoverable for seven days. Schedule a daily authenticated `POST` request to `/api/cron/purge-deleted` with `Authorization: Bearer $CRON_SECRET` to permanently purge data after the retention window.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
