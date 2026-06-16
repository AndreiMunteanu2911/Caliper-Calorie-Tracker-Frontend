const fs = require('fs');
const path = require('path');

function loadEnvFile(fileName) {
  const filePath = path.join(__dirname, '..', fileName);
  if (!fs.existsSync(filePath)) return;

  const contents = fs.readFileSync(filePath, 'utf8');
  for (const line of contents.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match) continue;

    const [, key, rawValue] = match;
    if (process.env[key]) continue;

    process.env[key] = rawValue.replace(/^['"]|['"]$/g, '');
  }
}

loadEnvFile('.env');
loadEnvFile('.env.local');

const apiUrl = process.env.EXPO_PUBLIC_API_URL;

if (!apiUrl) {
  console.error('EXPO_PUBLIC_API_URL must be configured before building Android.');
  process.exit(1);
}

let parsedUrl;
try {
  parsedUrl = new URL(apiUrl);
} catch {
  console.error(`EXPO_PUBLIC_API_URL is not a valid URL: ${apiUrl}`);
  process.exit(1);
}

const localHosts = new Set(['localhost', '127.0.0.1', '0.0.0.0']);

if (localHosts.has(parsedUrl.hostname)) {
  console.error(
    `EXPO_PUBLIC_API_URL is ${apiUrl}. Packaged Android apps cannot use localhost; use the deployed backend URL or a reachable LAN IP.`,
  );
  process.exit(1);
}
