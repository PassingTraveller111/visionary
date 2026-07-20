export function printUsage() {
  console.log(`Usage:
  npm run visionary -- auth login --username <username> --password <password> [--base-url <url>] [--remember]
  npm run visionary -- draft create --title <title> --content-file <path> [--summary <text>] [--tags <a,b>] [--cover <url>] [--keep-title]
  npm run visionary -- draft get --id <id>
  npm run visionary -- draft update --id <id> [--title <title>] [--content-file <path>] [--summary <text>] [--tags <a,b>] [--cover <url>] [--keep-title]
  npm run visionary -- draft publish --id <id> --confirm
  npm run visionary -- article list [--user-id <id>] [--limit <n>] [--published-only]
  npm run visionary -- article public-list [--page-num <n>] [--page-size <n>] [--sort new|hot]
  npm run visionary -- article search --keyword <text> [--page-num <n>] [--page-size <n>]
  npm run visionary -- article get --id <id>
  npm run visionary -- article delete --id <id> --confirm
  npm run visionary -- article cover-upload --file <path>
  npm run visionary -- article image-upload --file <path>
  npm run visionary -- column list [--user-id <id>]
  npm run visionary -- column get --id <id>
  npm run visionary -- column create --name <name> --description <text> [--cover <url>]
  npm run visionary -- column update --id <id> [--name <name>] [--description <text>] [--cover <url>]
  npm run visionary -- column delete --id <id> --confirm
  npm run visionary -- column articles --id <id>
  npm run visionary -- column set-articles --id <id> --article-ids <id,id>
  npm run visionary -- column candidates
  npm run visionary -- column cover-upload --file <path>

Options:
  --base-url <url>     Visionary site URL. Defaults to VISIONARY_BASE_URL, saved config, then localhost:3000/3001.
  --token <token>      Auth token value. Defaults to VISIONARY_TOKEN, then saved config.
  --cookie <cookie>    Full Cookie header. Defaults to VISIONARY_COOKIE.
  --remember           Ask login API to issue a longer-lived token.
  --confirm            Required for commands that publish content.
  --keep-title         Keep a leading H1 from --content-file. By default, leading H1 is stripped before upload.
  --json               Kept for agent compatibility. Output is always JSON.
  --help               Show this help.
`);
}

export function parseArgs(argv) {
  const args = [...argv];
  const command = args.shift();
  const subcommand = args.shift();
  const options = {};

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg.startsWith('--')) {
      throw new Error(`Unexpected argument: ${arg}`);
    }

    const key = arg.slice(2);
    if (key === 'json' || key === 'help' || key === 'remember' || key === 'confirm' || key === 'keep-title' || key === 'published-only') {
      options[toCamelCase(key)] = true;
      continue;
    }

    const value = args[index + 1];
    if (value === undefined || value.startsWith('--')) {
      throw new Error(`Missing value for --${key}`);
    }

    options[toCamelCase(key)] = value;
    index += 1;
  }

  return { command, subcommand, options };
}

export function output(data) {
  console.log(JSON.stringify(data, null, 2));
}

export function fail(message, details) {
  output({ success: false, error: message, details });
  process.exitCode = 1;
}

export function stripLeadingH1(content) {
  return content
    .replace(/^\uFEFF?\s*#\s+[^\n]*(?:\n+|$)/, '')
    .replace(/^\uFEFF?\s*<h1(?:\s+[^>]*)?>[\s\S]*?<\/h1>\s*/i, '');
}

export function parseTags(value, fallback = []) {
  if (value === undefined) return normalizeTags(fallback);

  const trimmed = value.trim();
  if (!trimmed) return [];

  if (trimmed.startsWith('[')) {
    const parsed = JSON.parse(trimmed);
    return normalizeTags(parsed);
  }

  return trimmed.split(',').map((tag) => tag.trim()).filter(Boolean);
}

export function parseIds(value) {
  if (value === undefined) return [];

  const trimmed = value.trim();
  if (!trimmed) return [];

  if (trimmed.startsWith('[')) {
    const parsed = JSON.parse(trimmed);
    if (!Array.isArray(parsed)) throw new Error('--article-ids JSON value must be an array.');
    return parsed.map((id) => String(id).trim()).filter(Boolean);
  }

  return trimmed.split(',').map((id) => id.trim()).filter(Boolean);
}

export function normalizeTags(value) {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {
      return value.split(',').map((tag) => tag.trim()).filter(Boolean);
    }
  }
  return [];
}

export function requireOption(options, key) {
  if (!options[key]) throw new Error(`Missing required option --${formatOptionName(key)}`);
  return options[key];
}

export function parseIntegerOption(options, key, fallback) {
  if (options[key] === undefined) return fallback;
  const value = Number(options[key]);
  if (!Number.isInteger(value)) throw new Error(`Invalid --${formatOptionName(key)} value.`);
  return value;
}

export function buildQuery(params) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') query.set(key, String(value));
  }
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
}

function toCamelCase(value) {
  return value.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
}

function formatOptionName(key) {
  return key.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);
}
