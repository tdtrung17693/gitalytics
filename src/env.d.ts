interface ImportMetaEnv {
  readonly PUBLIC_PLAUSIBLE_DOMAIN: string;
  readonly GITHUB_TOKEN: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
