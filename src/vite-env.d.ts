/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LEAD_WEBHOOK_URL?: string;
  readonly VITE_SALES_WHATSAPP?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
