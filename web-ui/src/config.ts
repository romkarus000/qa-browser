import type { AgentDownloadUrls } from '@qa/desktop-agent-client';

const releaseBase = import.meta.env.VITE_QA_AGENT_RELEASE_BASE as string | undefined;

function fromRelease(fileName: string): string | undefined {
  if (!releaseBase) return undefined;
  return `${releaseBase.replace(/\/$/, '')}/${fileName}`;
}

export const AGENT_DOWNLOADS: AgentDownloadUrls = {
  macArm64:
    (import.meta.env.VITE_QA_AGENT_DOWNLOAD_MAC_ARM64 as string | undefined) ||
    fromRelease('QA-Desktop-Agent-mac-arm64.dmg'),
  macX64:
    (import.meta.env.VITE_QA_AGENT_DOWNLOAD_MAC_X64 as string | undefined) ||
    fromRelease('QA-Desktop-Agent-mac-x64.dmg'),
  windows:
    (import.meta.env.VITE_QA_AGENT_DOWNLOAD_WINDOWS as string | undefined) ||
    fromRelease('QA-Desktop-Agent-win-x64.exe'),
};
