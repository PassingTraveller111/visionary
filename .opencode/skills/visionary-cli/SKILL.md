---
name: visionary-cli
description: Use when operating Visionary through the global visionary-cli npm package: article/draft/column list, get, search, create, update, publish, delete, upload cover/images, or auth login for visionaryblog.cn.
---

# Visionary CLI

Use this skill when the user asks to operate Visionary site data through the CLI instead of the browser or direct API calls.

Prefer `visionary-cli` for:

- Listing, searching, reading, or deleting articles.
- Creating, reading, updating, or publishing drafts.
- Listing, reading, creating, updating, deleting, or assigning column articles.
- Uploading article images, article covers, or column covers.
- Logging in or fixing missing CLI authentication.

## Installation

The CLI is distributed as a global npm package:

```bash
npm install -g visionary-cli
```

Before using it, verify the command is available:

```bash
visionary-cli --help
```

If `--help` is not supported by the installed version, running `visionary-cli` with no arguments should print usage.

## Authentication

The CLI reads authentication from these sources:

- Saved config at `~/.visionary-cli/config.json`.
- `VISIONARY_TOKEN` containing the token cookie value.
- `VISIONARY_COOKIE` containing the full Cookie header, for example `token=<value>`.

Login and save auth when needed:

```bash
visionary-cli auth login --base-url https://visionaryblog.cn --username <username> --password <password> --remember --json
```

Do not ask the user to paste secrets into chat unless there is no safer option. Prefer existing saved auth or environment variables.

## Common Commands

Article operations:

```bash
visionary-cli article list --published-only --limit 30 --json
visionary-cli article public-list --page-num 0 --page-size 20 --sort new --json
visionary-cli article search --keyword "React" --page-size 20 --json
visionary-cli article get --id <articleId> --json
visionary-cli article delete --id <articleId> --confirm --json
visionary-cli article cover-upload --file <path> --json
visionary-cli article image-upload --file <path> --json
```

Draft operations:

```bash
visionary-cli draft create --title "Article title" --content-file "tmp/article.md" --summary "Short summary" --tags "Next.js,React" --json
visionary-cli draft get --id <draftId> --json
visionary-cli draft update --id <draftId> --content-file "tmp/article.md" --title "Updated title" --json
visionary-cli draft publish --id <draftId> --confirm --json
```

Column operations:

```bash
visionary-cli column list --json
visionary-cli column get --id <columnId> --json
visionary-cli column create --name "Column name" --description "Column description" --json
visionary-cli column update --id <columnId> --name "New name" --description "New description" --json
visionary-cli column delete --id <columnId> --confirm --json
visionary-cli column articles --id <columnId> --json
visionary-cli column set-articles --id <columnId> --article-ids "1,2,3" --json
visionary-cli column candidates --json
visionary-cli column cover-upload --file <path> --json
```

## Publishing Workflow

When publishing content:

1. Create or update a Markdown file under `tmp/` when content is generated locally.
2. Create the draft with `visionary-cli draft create` or update it with `visionary-cli draft update`.
3. Publish only when the user explicitly asks to publish.
4. Use `visionary-cli draft publish --id <draftId> --confirm --json`.
5. Fetch the returned article with `visionary-cli article get --id <articleId> --json`.
6. Report draft id, article id, article URL, `is_published`, and `review_status`.

If `review_status` is `pending_review` or `is_published` is `0`, explain that the publish request was accepted but the article is not publicly visible yet.

## Safety Rules

- Use `--confirm` only when the user explicitly requested destructive or publishing actions.
- Do not delete articles, columns, or publish drafts based on inference alone.
- Do not fabricate article or draft ids. Fetch the relevant list or ask one short clarification question.
- Prefer `--content-file` over long inline `--content` for generated Markdown.
- Keep CLI output JSON in the final report only as summarized facts unless the user asks for raw output.
