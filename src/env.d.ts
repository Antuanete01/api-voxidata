/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly HCAPTCHA_SECRET?: string;
  readonly CONTACT_TO_EMAIL?: string;

  readonly SMTP_HOST?: string;
  readonly SMTP_PORT?: string;
  readonly SMTP_SECURE?: string;
  readonly SMTP_USER?: string;
  readonly SMTP_PASS?: string;

  readonly ALLOWED_ORIGIN?: string;

  // permite acceso dinámico env("NOMBRE")
  readonly [key: string]: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
