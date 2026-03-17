// src/pages/api/contact.ts
import type { APIRoute } from "astro";
import { env } from "../../lib/env";
import { verifyHCaptcha } from "../../lib/captcha";
import { createTransporter } from "../../lib/mailer";
import { buildEmailTemplate } from "../../lib/email-template";

export const prerender = false;

const ALLOWED_ORIGINS = [
  "http://localhost:4321",
  "https://voxidata.onrender.com",
  "https://api-voxidata.vercel.app/api/contact",
  "https://voxidata.com",
  "https://www.voxidata.com",
];

function getCorsHeaders(origin: string | null) {
  const allowedOrigin =
    origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function json(data: unknown, status = 200, origin: string | null = null) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...getCorsHeaders(origin),
    },
  });
}

export const OPTIONS: APIRoute = async ({ request }) => {
  const origin = request.headers.get("origin");

  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
};

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const origin = request.headers.get("origin");

  try {
    const formData = await request.formData();

    const fullName = String(formData.get("fullName") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const comment = String(formData.get("comment") || "").trim();
    const captchaToken = String(formData.get("h-captcha-response") || "").trim();

    if (!fullName || fullName.length < 3) {
      return json({ ok: false, message: "Nombre inválido" }, 400, origin);
    }

    if (!phone || phone.length < 7) {
      return json({ ok: false, message: "Teléfono inválido" }, 400, origin);
    }

    if (!email || !email.includes("@")) {
      return json({ ok: false, message: "Correo inválido" }, 400, origin);
    }

    if (!comment || comment.length < 10) {
      return json({ ok: false, message: "Comentario muy corto" }, 400, origin);
    }

    if (!captchaToken) {
      return json({ ok: false, message: "Completa el captcha" }, 400, origin);
    }

    const captchaOk = await verifyHCaptcha(captchaToken, clientAddress);
    if (!captchaOk) {
      return json(
        { ok: false, message: "Captcha inválido, intenta otra vez" },
        400,
        origin
      );
    }

    const CONTACT_TO_EMAIL = env("CONTACT_TO_EMAIL");
    const { transporter, SMTP_USER } = createTransporter();

    await transporter.verify();

    const { subject, text, html } = buildEmailTemplate({
      fullName,
      phone,
      email,
      comment,
    });

    await transporter.sendMail({
      from: `"Voxidata Web" <${SMTP_USER}>`,
      to: CONTACT_TO_EMAIL,
      replyTo: email,
      subject,
      text,
      html,
    });

    return json({ ok: true, message: "Mensaje enviado correctamente" }, 200, origin);
  } catch (e: any) {
    console.error("Error /api/contact:", e?.message || e, e);

    return json(
      { ok: false, message: "No se pudo enviar el correo. Revisa logs/SMTP." },
      500,
      origin
    );
  }
};
