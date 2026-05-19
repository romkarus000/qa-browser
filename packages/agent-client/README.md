# @qa/desktop-agent-client

TypeScript SDK for the QA Desktop Agent localhost API.

```typescript
import { createAgentClient } from '@qa/desktop-agent-client';

const agent = createAgentClient();

if (await agent.isAvailable()) {
  await agent.launchProfile(profile);
}
```

See [docs/INTEGRATION.md](../../docs/INTEGRATION.md).
