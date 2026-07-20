import { CONFIG_FILE, getResolvedBaseUrl, loginRequest, saveAuthConfig } from './api.mjs';
import { output } from './shared.mjs';

export async function handleAuthCommand(subcommand, options) {
  if (subcommand === 'login') return login(options);
  throw new Error(`Unknown auth subcommand: ${subcommand}`);
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

  await saveAuthConfig(token);

  output({
    success: true,
    action: 'auth.login',
    baseUrl: getResolvedBaseUrl(),
    configFile: CONFIG_FILE,
    user: sanitizeUser(data?.data),
  });
}

function sanitizeUser(user) {
  if (!user) return undefined;
  const safeUser = { ...user };
  delete safeUser.password;
  return safeUser;
}
