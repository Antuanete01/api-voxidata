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
  "https://api-voxidata.vercel.app",
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
    const contentType = request.headers.get("content-type") || "";

    let fullName = "";
    let phone = "";
    let email = "";
    let comment = "";
    let captchaToken = "";
    console.log("CONTENT-TYPE:", request.headers.get("content-type"));
    if (
      contentType.includes("multipart/form-data") ||
      contentType.includes("application/x-www-form-urlencoded")
    ) {
      const formData = await request.formData();
      fullName = String(formData.get("fullName") || "").trim();
      phone = String(formData.get("phone") || "").trim();
      email = String(formData.get("email") || "").trim();
      comment = String(formData.get("comment") || "").trim();
      captchaToken = String(formData.get("h-captcha-response") || "").trim();
    } else if (contentType.includes("application/json")) {
      const body = await request.json();
      fullName = String(body.fullName || "").trim();
      phone = String(body.phone || "").trim();
      email = String(body.email || "").trim();
      comment = String(body.comment || "").trim();
      captchaToken = String(body["h-captcha-response"] || body.captchaToken || "").trim();
    } else {
      return json(
        {
          ok: false,
          message:
            'Content-Type inválido. Usa multipart/form-data, application/x-www-form-urlencoded o application/json.',
        },
        400,
        origin
      );
    }

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
      {
        ok: false,
        message: e?.message || "Error interno en el envío",
      },
      500,
      origin
    );
  }
};