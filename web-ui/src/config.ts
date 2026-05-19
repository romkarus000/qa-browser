import type { AgentDownloadUrls } from '@qa/desktop-agent-client';

const releaseBase = import.meta.env.VITE_QA_AGENT_RELEASE_BASE as string | undefined;

function fromRelease(fileName: string): string | undefined {
  if (!releaseBase) return undefined;
  return `${releaseBase.replace(/\/$/, '')}/${fileName}`;
}

export const AGENT_DOWNLOADS: AgentDownloadUrls = {
  macArm64:
    (import.meta.env.VITE_QA_AGENT_DOWNLOAD_MAC_ARM64 as string | undefined) ||
    fromRelease('Magnific-QA-Desktop-Agent-1.0.0-mac-arm64.dmg') ||
    fromRelease('Magnific QA Desktop Agent-1.0.0-mac-arm64.dmg'),
  macX64:
    (import.meta.env.VITE_QA_AGENT_DOWNLOAD_MAC_X64 as string | undefined) ||
    fromRelease('Magnific-QA-Desktop-Agent-1.0.0-mac-x64.dmg') ||
    fromRelease('Magnific QA Desktop Agent-1.0.0-mac-x64.dmg'),
  windows:
    (import.meta.env.VITE_QA_AGENT_DOWNLOAD_WINDOWS as string | undefined) ||
    fromRelease('Magnific-QA-Desktop-Agent-1.0.0-win-x64.exe') ||
    fromRelease('Magnific QA Desktop Agent-1.0.0-win-x64.exe'),
};
