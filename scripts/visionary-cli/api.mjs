import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { basename, join } from 'node:path';

const DEFAULT_BASE_URLS = ['http://localhost:3000', 'http://localhost:3001'];
const CONFIG_DIR = join(homedir(), '.visionary-cli');

export const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

const endpoints = {
  login: '/api/auth/login',
  getUserInfo: '/api/users/me',
};

let resolvedBaseUrl;
let storedConfig = {};

export async function initializeConfig() {
  storedConfig = await loadConfig();
}

export function getResolvedBaseUrl() {
  return resolvedBaseUrl;
}

export async function request(path, options, init = {}) {
  const cookie = getCookie(options);
  const candidates = resolvedBaseUrl ? [resolvedBaseUrl] : getBaseUrlCandidates(options);
  let lastError;
  const hasJsonBody = typeof init.body === 'string';

  for (const baseUrl of candidates) {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        ...init,
        headers: {
          Accept: 'application/json',
          Cookie: cookie,
          ...(hasJsonBody ? { 'Content-Type': 'application/json' } : {}),
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

export async function loginRequest(options, body) {
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

export async function saveAuthConfig(token) {
  storedConfig = {
    ...storedConfig,
    baseUrl: resolvedBaseUrl,
    token,
  };
  await saveConfig(storedConfig);
}

export async function getCurrentUser(options) {
  const response = await request(endpoints.getUserInfo, options, { method: 'GET' });
  if (response?.ok !== true) {
    throw new Error('Failed to read current user info. Check token/cookie permissions.');
  }
  return response.data;
}

export async function uploadFileRequest(options, path, filePath) {
  const buffer = await readFile(filePath);
  const formData = new FormData();
  formData.append('file', new Blob([buffer]), basename(filePath));

  const response = await request(path, options, {
    method: 'POST',
    body: formData,
  });

  if (response?.ok !== true) {
    throw new Error(response?.error?.message || 'Failed to upload file.');
  }

  return response.data;
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

function parseTokenFromSetCookie(setCookie) {
  const match = setCookie.match(/(?:^|,\s*)token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}
