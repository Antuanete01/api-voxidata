// src/lib/mailer.ts
import nodemailer from "nodemailer";
import { env } from "./env";
import { normalizeSmtpPass } from "./sanitize";

export function createTransporter() {
  const SMTP_HOST = env("SMTP_HOST");
  const SMTP_PORT = Number(env("SMTP_PORT"));
  const SMTP_SECURE = String(import.meta.env.SMTP_SECURE || "true") === "true";
  const SMTP_USER = env("SMTP_USER");
  const SMTP_PASS = normalizeSmtpPass(env("SMTP_PASS"));

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  return { transporter, SMTP_USER };
}
