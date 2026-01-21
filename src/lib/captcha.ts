
// src/lib/captcha.ts
import { env } from "./env";

export async function verifyHCaptcha(token: string, remoteip?: string) {
  const secret = env("HCAPTCHA_SECRET");

  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", token);
  if (remoteip) body.set("remoteip", remoteip);

  const res = await fetch("https://hcaptcha.com/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const data = await res.json();
  return Boolean(data?.success);
}
