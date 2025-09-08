#!/usr/bin/env node
// Offline-friendly CLI shim for dist/src/index.js
// Provides help output and avoids heavy init when building with limited scope.

const argv = process.argv.slice(2);
if (argv.includes('--help') || argv.includes('-h')) {
  const msg = `\nMCP-ocs Server (CLI Shim)\n\nUsage:\n  node dist/src/index.js [--help]\n\nCommon env flags:\n  ENABLE_TEMPLATE_ENGINE=true\n  ENABLE_RUBRICS=true\n  SHARED_MEMORY_DIR=./memory\n\nNotes:\n  - This shim prints help without initializing the server.\n  - Use \`npm run start\` or \`npm run start:beta\` to launch.\n`;
  console.log(msg);
  process.exit(0);
}

console.log('MCP-ocs CLI shim: use "npm run start" or "npm run start:beta" to launch the server.');
process.exit(0);

