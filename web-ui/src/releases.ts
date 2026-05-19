import type { AgentDownloadUrls } from '@qa/desktop-agent-client';

const GITHUB_REPO = 'romkarus000/qa-browser';

function fromEnvBase(fileName: string): string | undefined {
  const releaseBase = import.meta.env.VITE_QA_AGENT_RELEASE_BASE as string | undefined;
  if (!releaseBase) return undefined;
  return `${releaseBase.replace(/\/$/, '')}/${fileName}`;
}

/** Static fallbacks — must match electron-builder artifact names (dots, not spaces). */
const FALLBACK: AgentDownloadUrls = {
  macArm64: fromEnvBase('Magnific.QA.Desktop.Agent-1.0.0-mac-arm64.zip'),
  macX64: fromEnvBase('Magnific.QA.Desktop.Agent-1.0.0-mac-x64.zip'),
  windows: fromEnvBase('Magnific.QA.Desktop.Agent-1.0.0-win-x64.exe'),
};

export async function fetchReleaseDownloads(): Promise<AgentDownloadUrls> {
  const envOverride: AgentDownloadUrls = {
    macArm64: import.meta.env.VITE_QA_AGENT_DOWNLOAD_MAC_ARM64 as string | undefined,
    macX64: import.meta.env.VITE_QA_AGENT_DOWNLOAD_MAC_X64 as string | undefined,
    windows: import.meta.env.VITE_QA_AGENT_DOWNLOAD_WINDOWS as string | undefined,
  };

  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`, {
      headers: { Accept: 'application/vnd.github+json' },
    });
    if (!res.ok) return { ...FALLBACK, ...pickDefined(envOverride) };

    const data = (await res.json()) as {
      assets?: { name: string; browser_download_url: string }[];
    };

    const assets = data.assets ?? [];
    const byPattern = (pattern: RegExp) =>
      assets.find((a) => pattern.test(a.name))?.browser_download_url;

    const fromApi: AgentDownloadUrls = {
      macArm64: byPattern(/mac-arm64\.zip$/i),
      macX64: byPattern(/mac-x64\.zip$/i),
      windows: byPattern(/win.*\.exe$/i),
    };

    return {
      macArm64: envOverride.macArm64 ?? fromApi.macArm64 ?? FALLBACK.macArm64,
      macX64: envOverride.macX64 ?? fromApi.macX64 ?? FALLBACK.macX64,
      windows: envOverride.windows ?? fromApi.windows ?? FALLBACK.windows,
    };
  } catch {
    return { ...FALLBACK, ...pickDefined(envOverride) };
  }
}

function pickDefined(urls: AgentDownloadUrls): Partial<AgentDownloadUrls> {
  return Object.fromEntries(
    Object.entries(urls).filter(([, v]) => typeof v === 'string' && v.length > 0)
  ) as Partial<AgentDownloadUrls>;
}
