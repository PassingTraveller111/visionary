#!/usr/bin/env node

import process from 'node:process';
import { handleArticleCommand } from './visionary-cli/article.mjs';
import { handleAuthCommand } from './visionary-cli/auth.mjs';
import { handleColumnCommand } from './visionary-cli/column.mjs';
import { handleDraftCommand } from './visionary-cli/draft.mjs';
import { initializeConfig } from './visionary-cli/api.mjs';
import { fail, parseArgs, printUsage } from './visionary-cli/shared.mjs';

async function main() {
  await initializeConfig();
  const { command, subcommand, options } = parseArgs(process.argv.slice(2));

  if (options.help || command === '--help' || !command) {
    printUsage();
    return;
  }

  if (command === 'auth') return handleAuthCommand(subcommand, options);
  if (command === 'draft') return handleDraftCommand(subcommand, options);
  if (command === 'article') return handleArticleCommand(subcommand, options);
  if (command === 'column') return handleColumnCommand(subcommand, options);

  throw new Error(`Unknown command: ${command}`);
}

main().catch((error) => {
  fail(error.message, error.details);
});
