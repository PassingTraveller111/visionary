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

## Visionary CLI

The local CLI is intended for agents and scripts that need to operate drafts through the existing website API.

Login once and save the token locally:

```bash
npm run visionary -- auth login --base-url https://visionaryblog.cn --username <username> --password <password> --remember --json
```

The token is stored in `~/.visionary-cli/config.json`. You can still override auth with environment variables:

```bash
export VISIONARY_BASE_URL=https://visionaryblog.cn
export VISIONARY_TOKEN=<token-cookie-value>
# or
export VISIONARY_COOKIE='token=<token-cookie-value>'
```

Create a draft:

```bash
npm run visionary -- draft create --title "Article title" --content-file ./draft.md --summary "Short summary" --tags "Next.js,React" --json
```

Read a draft:

```bash
npm run visionary -- draft get --id 1 --json
```

Update a draft:

```bash
npm run visionary -- draft update --id 1 --content-file ./draft.md --title "Updated title" --json
```

Publish a draft:

```bash
npm run visionary -- draft publish --id 1 --confirm --json
```

Publishing requires `--confirm` to avoid accidental release by agents or scripts.

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
