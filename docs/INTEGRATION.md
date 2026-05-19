# Web UI Integration

## Install SDK

```bash
npm install @qa/desktop-agent-client
```

In this monorepo:

```json
{
  "dependencies": {
    "@qa/desktop-agent-client": "*"
  }
}
```

## Minimal usage

```typescript
import { createAgentClient, AgentClientError } from '@qa/desktop-agent-client';

const agent = createAgentClient();

const health = await agent.checkHealth();
if (!health) {
  // show install banner
}

await agent.launchProfile(profileFromYourApi);
```

## Production checklist

1. Add your staging/QA origins to `~/.qa-desktop-agent/config.json` on each QA machine, or ship a managed config via MDM.
2. Use `allowedHostSuffixes: [".yourcompany.com"]` for all HTTPS subdomains.
3. Build Web UI with release URLs:

```bash
VITE_QA_AGENT_RELEASE_BASE=https://github.com/org/repo/releases/download/v1.0.0 npm run build
```

4. Never log or persist `authToken` in your backend — it stays local on the user's machine.

## API reference

| Client method | Agent endpoint |
|---------------|----------------|
| `checkHealth()` | `GET /health` |
| `launchProfile(p)` | `POST /sessions/launch` |
| `listSessions()` | `GET /sessions` |
| `closeSession(id)` | `POST /sessions/:id/close` |
| `clearProfileStorage(id)` | `POST /profiles/:id/clear-storage` |
| `openDiagnostics()` | opens `GET /diagnostics` |

## Embed in React

```tsx
const agent = useMemo(() => createAgentClient(), []);

useEffect(() => {
  agent.checkHealth().then((h) => setConnected(Boolean(h)));
}, [agent]);
```
