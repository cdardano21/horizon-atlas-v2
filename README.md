# Horizon Atlas V2

A premium AI-powered retirement and relocation platform built with Next.js, React, TypeScript, and Tailwind CSS.

See the project vision and product roadmap in [VISION.md](VISION.md).

Destination scaling architecture and ingestion strategy are documented in [docs/destination-data-engine-strategy.md](docs/destination-data-engine-strategy.md).

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

## Command Center Data Pipeline

Generate catalog-wide factual command-center seeds from the DRI workbooks:

```bash
npm run build:command-center-seeds
```

Generate normalized-table SQL for Supabase:

```bash
npm run build:command-center-sql
```

Apply the generated SQL directly to Supabase Postgres:

```bash
SUPABASE_DB_URL="postgresql://..." npm run apply:command-center-sql
```

Artifacts:

- `app/lib/generated-command-center-seeds.ts`
- `supabase/generated-command-center-seeds.json`
- `supabase/generated-command-center-seed.sql`

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
