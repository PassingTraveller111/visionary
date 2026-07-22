#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$PROJECT_ROOT/.env.local"

if [[ -f "$ENV_FILE" ]]; then
  TOKEN_LINE="$(grep -E "^PLAYWRIGHT_MCP_EXTENSION_TOKEN=" "$ENV_FILE" || true)"
  PLAYWRIGHT_MCP_EXTENSION_TOKEN="${TOKEN_LINE#PLAYWRIGHT_MCP_EXTENSION_TOKEN=}"
  FIRST_CHAR="${PLAYWRIGHT_MCP_EXTENSION_TOKEN:0:1}"
  LAST_CHAR="${PLAYWRIGHT_MCP_EXTENSION_TOKEN: -1}"
  if [[ ( "$FIRST_CHAR" == '"' && "$LAST_CHAR" == '"' ) || ( "$FIRST_CHAR" == "'" && "$LAST_CHAR" == "'" ) ]]; then
    PLAYWRIGHT_MCP_EXTENSION_TOKEN="${PLAYWRIGHT_MCP_EXTENSION_TOKEN:1:${#PLAYWRIGHT_MCP_EXTENSION_TOKEN}-2}"
  fi
  export PLAYWRIGHT_MCP_EXTENSION_TOKEN
else
  echo "Warning: $ENV_FILE not found" >&2
fi

exec npx -y @playwright/mcp@latest --extension
