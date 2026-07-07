#!/usr/bin/env node

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import process from 'node:process';

const DEFAULT_BASE_URLS = ['http://localhost:3000', 'http://localhost:3001'];
const CONFIG_DIR = join(homedir(), '.visionary-cli');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

const endpoints = {
  login: '/api/user/login',
  getUserInfo: '/api/protected/user/getUserInfo',
  getDraft: '/api/protected/draft/getDraft',
  updateDraft: '/api/protected/draft/updateDraft',
  publishDraft: '/api/protected/draft/publishDraft',
};

let resolvedBaseUrl;
let storedConfig = {};

function printUsage() {
  console.log(`Usage:
  npm run visionary -- auth login --username <username> --password <password> [--base-url <url>] [--remember]
  npm run visionary -- draft create --title <title> --content-file <path> [--summary <text>] [--tags <a,b>] [--cover <url>]
  npm run visionary -- draft get --id <id>
  npm run visionary -- draft update --id <id> [--title <title>] [--content-file <path>] [--summary <text>] [--tags <a,b>] [--cover <url>]
  npm run visionary -- draft publish --id <id> --confirm

Options:
  --base-url <url>     Visionary site URL. Defaults to VISIONARY_BASE_URL, saved config, then localhost:3000/3001.
  --token <token>      Auth token value. Defaults to VISIONARY_TOKEN, then saved config.
  --cookie <cookie>    Full Cookie header. Defaults to VISIONARY_COOKIE.
  --remember           Ask login API to issue a longer-lived token.
  --confirm            Required for commands that publish content.
  --json               Kept for agent compatibility. Output is always JSON.
  --help               Show this help.
`);
}

function parseArgs(argv) {
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
    if (key === 'json' || key === 'help' || key === 'remember' || key === 'confirm') {
      options[key] = true;
      continue;
    }

    const value = args[index + 1];
    if (!value || value.startsWith('--')) {
      throw new Error(`Missing value for --${key}`);
    }

    options[toCamelCase(key)] = value;
    index += 1;
  }

  return { command, subcommand, options };
}

function toCamelCase(value) {
  return value.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
}

function output(data) {
  console.log(JSON.stringify(data, null, 2));
}

function fail(message, details) {
  output({ success: false, error: message, details });
  process.exitCode = 1;
}

function getBaseUrlCandidates(options) {
  const configuredBaseUrl = options.baseUrl || process.env.VISIONARY_BASE_URL || storedConfig.baseUrl;
  if (configuredBaseUrl) return [normalizeBaseUrl(configuredBaseUrl)];
  return DEFAULT_BASE_URLS;
}

function normalizeBaseUrl(baseUrl) {
  try {
    return new URL(baseUrl).origin;
  } catch {
    return baseUrl.replace(/\/+$/, '');
  }
}

function getCookie(options) {
  const cookie = options.cookie || process.env.VISIONARY_COOKIE;
  if (cookie) return cookie;

  const token = options.token || process.env.VISIONARY_TOKEN || storedConfig.token;
  if (token) return `token=${token}`;

  throw new Error('Missing auth. Run auth login, or provide --token, --cookie, VISIONARY_TOKEN, or VISIONARY_COOKIE.');
}

async function loadConfig() {
  try {
    const configText = await readFile(CONFIG_FILE, 'utf8');
    return JSON.parse(configText);
  } catch (error) {
    if (error.code === 'ENOENT') return {};
    throw error;
  }
}

async function saveConfig(config) {
  await mkdir(CONFIG_DIR, { recursive: true, mode: 0o700 });
  await writeFile(CONFIG_FILE, `${JSON.stringify(config, null, 2)}\n`, { mode: 0o600 });
}

async function request(path, options, init = {}) {
  const cookie = getCookie(options);
  const candidates = resolvedBaseUrl ? [resolvedBaseUrl] : getBaseUrlCandidates(options);
  let lastError;

  for (const baseUrl of candidates) {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        ...init,
        headers: {
          Accept: 'application/json',
          Cookie: cookie,
          ...(init.body ? { 'Content-Type': 'application/json' } : {}),
          ...init.headers,
        },
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : null;

      if (!response.ok) {
        lastError = new Error(`HTTP ${response.status}`);
        lastError.details = data;
        if (response.status === 404 && !resolvedBaseUrl) continue;
        throw lastError;
      }

      resolvedBaseUrl = baseUrl;
      return data;
    } catch (error) {
      lastError = error;
      if (resolvedBaseUrl) break;
    }
  }

  throw lastError;
}

async function loginRequest(options, body) {
  const candidates = getBaseUrlCandidates(options);
  let lastError;

  for (const baseUrl of candidates) {
    try {
      const response = await fetch(`${baseUrl}${endpoints.login}`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : null;

      if (!response.ok) {
        lastError = new Error(data?.message || data?.msg || `HTTP ${response.status}`);
        lastError.details = data;
        if (response.status === 404) continue;
        throw lastError;
      }

      const setCookie = response.headers.get('set-cookie') || '';
      const token = parseTokenFromSetCookie(setCookie);
      if (!token) {
        throw new Error('Login succeeded but no token cookie was returned.');
      }

      resolvedBaseUrl = baseUrl;
      return { data, token };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

function parseTokenFromSetCookie(setCookie) {
  const match = setCookie.match(/(?:^|,\s*)token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

async function login(options) {
  const username = options.username || process.env.VISIONARY_USERNAME;
  const password = options.password || process.env.VISIONARY_PASSWORD;

  if (!username) throw new Error('Missing required option --username or VISIONARY_USERNAME');
  if (!password) throw new Error('Missing required option --password or VISIONARY_PASSWORD');

  const { data, token } = await loginRequest(options, {
    username,
    password,
    isRemember: Boolean(options.remember),
  });

  storedConfig = {
    ...storedConfig,
    baseUrl: resolvedBaseUrl,
    token,
  };
  await saveConfig(storedConfig);

  output({
    success: true,
    action: 'auth.login',
    baseUrl: resolvedBaseUrl,
    configFile: CONFIG_FILE,
    user: sanitizeUser(data?.data),
  });
}

function sanitizeUser(user) {
  if (!user) return undefined;
  const { password, ...safeUser } = user;
  return safeUser;
}

async function getCurrentUser(options) {
  const response = await request(endpoints.getUserInfo, options, { method: 'GET' });
  if (response?.msg !== 'success') {
    throw new Error('Failed to read current user info. Check token/cookie permissions.');
  }
  return response.data;
}

async function readDraft(options, id) {
  const response = await request(endpoints.getDraft, options, {
    method: 'POST',
    body: JSON.stringify({ draftId: Number(id) }),
  });

  if (response?.msg !== 'success') {
    throw new Error(typeof response?.data === 'string' ? response.data : 'Failed to read draft.');
  }

  return response.data;
}

async function saveDraft(options, draft) {
  const response = await request(endpoints.updateDraft, options, {
    method: 'POST',
    body: JSON.stringify(draft),
  });

  if (response?.msg !== 'success') {
    throw new Error('Failed to save draft.');
  }

  return response.data;
}

async function publishDraftRequest(options, draftId) {
  const response = await request(endpoints.publishDraft, options, {
    method: 'POST',
    body: JSON.stringify({ draftId: Number(draftId) }),
  });

  if (response?.msg !== 'success') {
    throw new Error(typeof response?.data === 'string' ? response.data : 'Failed to publish draft.');
  }

  return response.data;
}

async function loadContent(options, existingContent = '') {
  if (!options.contentFile) return existingContent;
  return readFile(options.contentFile, 'utf8');
}

function parseTags(value, fallback = []) {
  if (value === undefined) return normalizeTags(fallback);

  const trimmed = value.trim();
  if (!trimmed) return [];

  if (trimmed.startsWith('[')) {
    const parsed = JSON.parse(trimmed);
    return normalizeTags(parsed);
  }

  return trimmed.split(',').map((tag) => tag.trim()).filter(Boolean);
}

function normalizeTags(value) {
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

function requireOption(options, key) {
  if (!options[key]) throw new Error(`Missing required option --${key.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`)}`);
  return options[key];
}

async function createDraft(options) {
  const title = requireOption(options, 'title');
  requireOption(options, 'contentFile');

  const [user, content] = await Promise.all([
    getCurrentUser(options),
    loadContent(options),
  ]);

  const data = await saveDraft(options, {
    draftId: 'new',
    title,
    content,
    summary: options.summary || '',
    tags: parseTags(options.tags),
    author_id: user.id,
    author_nickname: user.nick_name,
    cover: options.cover || '',
  });

  const draftId = data?.insertId;
  output({
    success: true,
    action: 'draft.create',
    draftId,
    editUrl: draftId ? `${resolvedBaseUrl}/editor/draft/${draftId}` : undefined,
    data,
  });
}

async function getDraft(options) {
  const id = requireOption(options, 'id');
  const draft = await readDraft(options, id);
  output({ success: true, action: 'draft.get', draft });
}

async function updateDraft(options) {
  const id = requireOption(options, 'id');
  const existingDraft = await readDraft(options, id);
  const content = await loadContent(options, existingDraft.content || '');

  const data = await saveDraft(options, {
    draftId: Number(id),
    title: options.title ?? existingDraft.title ?? '',
    content,
    summary: options.summary ?? existingDraft.summary ?? '',
    tags: parseTags(options.tags, existingDraft.tags),
    author_id: existingDraft.author_id,
    author_nickname: existingDraft.author_nickname,
    cover: options.cover ?? existingDraft.cover ?? '',
  });

  output({
    success: true,
    action: 'draft.update',
    draftId: Number(id),
    editUrl: `${resolvedBaseUrl}/editor/draft/${id}`,
    data,
  });
}

async function publishDraft(options) {
  if (!options.confirm) {
    throw new Error('Publishing requires --confirm to avoid accidental release.');
  }

  const id = requireOption(options, 'id');
  const draft = await readDraft(options, id);
  validatePublishableDraft(draft);

  const data = await publishDraftRequest(options, id);
  const articleId = data?.article_id;

  output({
    success: true,
    action: 'draft.publish',
    draftId: data?.draft_id ?? Number(id),
    reviewId: data?.review_id,
    articleId,
    articleUrl: articleId ? `${resolvedBaseUrl}/reader/${articleId}` : undefined,
    note: 'The backend marks the article published after its async review step completes.',
    data,
  });
}

function validatePublishableDraft(draft) {
  const missing = [];
  if (!draft.title) missing.push('title');
  if (!draft.content) missing.push('content');
  if (!draft.summary) missing.push('summary');
  if (!normalizeTags(draft.tags).length) missing.push('tags');

  if (missing.length) {
    throw new Error(`Draft is not publishable. Missing: ${missing.join(', ')}.`);
  }
}

async function main() {
  storedConfig = await loadConfig();
  const { command, subcommand, options } = parseArgs(process.argv.slice(2));

  if (options.help || command === '--help' || !command) {
    printUsage();
    return;
  }

  if (command === 'auth') {
    if (subcommand === 'login') return login(options);
    throw new Error(`Unknown auth subcommand: ${subcommand}`);
  }

  if (command !== 'draft') {
    throw new Error(`Unknown command: ${command}`);
  }

  if (subcommand === 'create') return createDraft(options);
  if (subcommand === 'get') return getDraft(options);
  if (subcommand === 'update') return updateDraft(options);
  if (subcommand === 'publish') return publishDraft(options);

  throw new Error(`Unknown draft subcommand: ${subcommand}`);
}

main().catch((error) => {
  fail(error.message, error.details);
});
