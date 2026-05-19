import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { loadConfig } = require('../dist/main/config');
const { createApiServer } = require('../dist/server/api');

const config = loadConfig();
const server = createApiServer(config);

await server.start();
const res = await fetch('http://127.0.0.1:43127/health');
console.log('health:', await res.json());
await server.stop();
