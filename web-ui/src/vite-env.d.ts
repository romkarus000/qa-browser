/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_SITE_URL?: string;
  readonly VITE_QA_AGENT_RELEASE_BASE?: string;
  readonly VITE_QA_AGENT_DOWNLOAD_MAC_ARM64?: string;
  readonly VITE_QA_AGENT_DOWNLOAD_MAC_X64?: string;
  readonly VITE_QA_AGENT_DOWNLOAD_WINDOWS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
