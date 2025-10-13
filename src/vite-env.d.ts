/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_NODE_ENV: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_ENABLE_CAMERA: string
  readonly VITE_ENABLE_GALLERY: string
  readonly VITE_ENABLE_ADMIN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
