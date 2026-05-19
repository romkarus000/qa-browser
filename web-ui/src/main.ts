import './styles.css';
import {
  createAgentClient,
  resolveDownloadUrls,
  AgentClientError,
  type HealthResponse,
  type BrowserSession,
  type QAProfile,
} from '@qa/desktop-agent-client';
import { AGENT_DOWNLOADS } from './config';
import { loadProfiles } from './profiles';

const QA_UI_URL = import.meta.env.VITE_QA_UI_URL ?? 'https://qa.piemnaya.ru';
const TARGET_SITE_URL = import.meta.env.VITE_TARGET_SITE_URL ?? 'https://magnific.com';
const agent = createAgentClient();
const downloads = resolveDownloadUrls(AGENT_DOWNLOADS);

const app = document.getElementById('app')!;

let health: HealthResponse | null = null;
let sessions: BrowserSession[] = [];
let profiles: QAProfile[] = [];

function sessionForProfile(profileId: string): BrowserSession | undefined {
  return sessions.find((s) => s.profileId === profileId);
}

function renderAgentStatus(): string {
  if (health) {
    return `
      <div class="agent-status connected">
        <h2>Desktop Agent: <span class="status-ok">Connected</span></h2>
        <p>Version ${health.version} · ${health.platform} · Playwright ${health.playwright}</p>
        <div class="btn-row">
          <button type="button" id="btn-recheck">Проверить снова</button>
        </div>
      </div>
    `;
  }

  const macHref = downloads.mac ?? '#';
  const winHref = downloads.windows ?? '#';

  return `
    <div class="agent-status disconnected">
      <h2>Desktop Agent: <span class="status-bad">Not found</span></h2>
      <div class="install-hint">
        <p>Установите QA Desktop Agent на этот компьютер и оставьте его запущенным (иконка в системном трее).</p>
        <div class="btn-row">
          <a class="btn ${downloads.mac ? '' : 'disabled'}" href="${macHref}" ${downloads.mac ? 'download' : 'aria-disabled="true"'}>Download for macOS (zip)</a>
          <a class="btn ${downloads.windows ? '' : 'disabled'}" href="${winHref}" ${downloads.windows ? 'download' : 'aria-disabled="true"'}>Download for Windows</a>
          <button type="button" id="btn-recheck">Проверить снова</button>
        </div>
        <p class="hint">Ссылки на установщики появятся после первого <a href="https://github.com" target="_blank" rel="noopener">GitHub Release</a> (см. SETUP.md).</p>
      </div>
    </div>
  `;
}

function renderProfileCard(profile: QAProfile): string {
  const session = sessionForProfile(profile.id);
  const isRunning = Boolean(session);

  return `
    <article class="profile-card ${isRunning ? 'running' : ''}">
      <h3>${profile.name}</h3>
      <p class="profile-meta">${profile.deviceLabel ?? ''} · ${profile.viewport.width}×${profile.viewport.height}</p>
      <p class="profile-url">${profile.targetUrl}</p>
      ${isRunning ? `<p class="profile-status running">Running · ${session!.sessionId}</p>` : ''}
      <div class="btn-row">
        <button type="button" class="primary btn-launch" data-id="${profile.id}" ${!health || isRunning ? 'disabled' : ''}>Launch local browser</button>
        <button type="button" class="btn-diagnostics" ${!health ? 'disabled' : ''}>Open diagnostics</button>
        <button type="button" class="btn-clear" data-id="${profile.id}" ${!health || isRunning ? 'disabled' : ''}>Clear local storage</button>
        ${isRunning ? `<button type="button" class="btn-close" data-session="${session!.sessionId}">Close session</button>` : ''}
      </div>
      <p class="message" data-msg="${profile.id}"></p>
    </article>
  `;
}

function formatError(e: unknown): string {
  if (e instanceof AgentClientError) return e.message;
  if (e instanceof Error) return e.message;
  return 'Unknown error';
}

function bindEvents(): void {
  document.getElementById('btn-recheck')?.addEventListener('click', () => void refresh());

  document.querySelectorAll('.btn-launch').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = (btn as HTMLButtonElement).dataset.id!;
      const profile = profiles.find((p) => p.id === id);
      if (!profile) return;
      const msg = document.querySelector(`[data-msg="${id}"]`)!;
      msg.textContent = 'Запуск…';
      msg.className = 'message';
      try {
        const result = await agent.launchProfile(profile);
        msg.textContent = `Запущено: ${result.sessionId}`;
      } catch (e) {
        msg.textContent = formatError(e);
        msg.className = 'message error';
      }
      await refresh();
    });
  });

  document.querySelectorAll('.btn-diagnostics').forEach((btn) => {
    btn.addEventListener('click', () => agent.openDiagnostics());
  });

  document.querySelectorAll('.btn-clear').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = (btn as HTMLButtonElement).dataset.id!;
      const msg = document.querySelector(`[data-msg="${id}"]`)!;
      try {
        await agent.clearProfileStorage(id);
        msg.textContent = `Storage cleared: ${id}`;
        msg.className = 'message';
      } catch (e) {
        msg.textContent = formatError(e);
        msg.className = 'message error';
      }
    });
  });

  document.querySelectorAll('.btn-close').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const sessionId = (btn as HTMLButtonElement).dataset.session!;
      try {
        await agent.closeSession(sessionId);
      } catch (e) {
        alert(formatError(e));
      }
      await refresh();
    });
  });
}

function render(): void {
  const list =
    profiles.length > 0
      ? profiles.map(renderProfileCard).join('')
      : '<p class="empty">Нет профилей. Проверьте <code>public/profiles.json</code>.</p>';

  app.innerHTML = `
    <main class="container">
      <header class="hero">
        <p class="eyebrow">QA Browser</p>
        <h1>Local Browser Profiles</h1>
        <p class="subtitle">
          Панель: <a href="${QA_UI_URL}" target="_blank" rel="noopener">qa.piemnaya.ru</a>
          · тестируемый сайт:
          <a href="${TARGET_SITE_URL}" target="_blank" rel="noopener">magnific.com</a>
        </p>
      </header>
      ${renderAgentStatus()}
      <section class="profiles">${list}</section>
    </main>
  `;
  bindEvents();
}

async function refresh(): Promise<void> {
  health = await agent.checkHealth();
  sessions = health ? await agent.listSessions().catch(() => []) : [];
  render();
}

async function init(): Promise<void> {
  profiles = await loadProfiles();
  await refresh();
  setInterval(() => void refresh(), 8000);
}

void init();
