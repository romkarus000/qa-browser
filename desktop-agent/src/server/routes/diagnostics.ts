import type { FastifyInstance } from 'fastify';

const DIAGNOSTICS_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>QA Profile Diagnostics</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 2rem; background: #0f172a; color: #e2e8f0; }
    h1 { color: #38bdf8; }
    table { border-collapse: collapse; width: 100%; max-width: 900px; }
    th, td { border: 1px solid #334155; padding: 0.5rem 0.75rem; text-align: left; }
    th { background: #1e293b; width: 280px; }
    td { word-break: break-all; }
    .section { margin-top: 2rem; }
    #server-headers { white-space: pre-wrap; font-family: monospace; font-size: 0.85rem; }
  </style>
</head>
<body>
  <h1>QA Profile Diagnostics</h1>
  <p>Client-side values from this browser context:</p>
  <table id="client-table"></table>

  <div class="section">
    <h2>Server-side request headers</h2>
    <p>Loaded from agent API (reflects how the server sees this browser):</p>
    <pre id="server-headers">Loading…</pre>
  </div>

  <script>
    const rows = [
      ['navigator.userAgent', navigator.userAgent],
      ['navigator.language', navigator.language],
      ['navigator.languages', JSON.stringify(navigator.languages)],
      ['Intl timezone', Intl.DateTimeFormat().resolvedOptions().timeZone],
      ['window.innerWidth', String(window.innerWidth)],
      ['window.innerHeight', String(window.innerHeight)],
      ['window.devicePixelRatio', String(window.devicePixelRatio)],
      ['navigator.maxTouchPoints', String(navigator.maxTouchPoints)],
      ['navigator.platform', navigator.platform],
      ['screen.width', String(screen.width)],
      ['screen.height', String(screen.height)],
    ];

    const table = document.getElementById('client-table');
    rows.forEach(([label, value]) => {
      const tr = document.createElement('tr');
      tr.innerHTML = '<th>' + label + '</th><td>' + value + '</td>';
      table.appendChild(tr);
    });

    fetch('/diagnostics/headers')
      .then((r) => r.json())
      .then((data) => {
        document.getElementById('server-headers').textContent = JSON.stringify(data, null, 2);
      })
      .catch((e) => {
        document.getElementById('server-headers').textContent = 'Failed: ' + e.message;
      });
  </script>
</body>
</html>`;

export async function registerDiagnosticsRoutes(app: FastifyInstance): Promise<void> {
  app.get('/diagnostics', async (_request, reply) => {
    reply.type('text/html').send(DIAGNOSTICS_HTML);
  });

  app.get('/diagnostics/headers', async (request, reply) => {
    const headers = request.headers;
    return reply.send({
      'user-agent': headers['user-agent'] ?? null,
      'accept-language': headers['accept-language'] ?? null,
      'x-qa-profile': headers['x-qa-profile'] ?? null,
      'x-qa-token': headers['x-qa-token'] ? '[present]' : null,
      'x-qa-client-ip': request.ip,
      externalIp: null,
    });
  });
}
