/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_DOMAIN_URL?: string;
  readonly VITE_API_KEY?: string;
  readonly VITE_AUTH_HEADER?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
