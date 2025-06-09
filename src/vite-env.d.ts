/// <reference types="vite/client" />

declare global {
  interface ImportMetaEnv {
    readonly VITE_API_URL: string
    readonly VITE_APP_TITLE: string
    // Add more environment variables as needed
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
}

export {}
