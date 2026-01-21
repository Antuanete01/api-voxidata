// src/pages/api/contact.ts
import type { APIRoute } from "astro";
import { env } from "../../lib/env";
import { verifyHCaptcha } from "../../lib/captcha";
import { createTransporter } from "../../lib/mailer";
import { buildEmailTemplate } from "../../lib/email-template";

export const prerender = false;

export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    const formData = await request.formData();

    const fullName = String(formData.get("fullName") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const comment = String(formData.get("comment") || "").trim();
    const captchaToken = String(formData.get("h-captcha-response") || "").trim();

    // Validaciones
    if (!fullName || fullName.length < 3) {
      return new Response(JSON.stringify({ ok: false, message: "Nombre inválido" }), { status: 400 });
    }
    if (!phone || phone.length < 7) {
      return new Response(JSON.stringify({ ok: false, message: "Teléfono inválido" }), { status: 400 });
    }
    if (!email.includes("@")) {
      return new Response(JSON.stringify({ ok: false, message: "Correo inválido" }), { status: 400 });
    }
    if (!comment || comment.length < 10) {
      return new Response(JSON.stringify({ ok: false, message: "Comentario muy corto" }), { status: 400 });
    }
    if (!captchaToken) {
      return new Response(JSON.stringify({ ok: false, message: "Completa el captcha" }), { status: 400 });
    }

    // Captcha
    const captchaOk = await verifyHCaptcha(captchaToken, clientAddress);
    if (!captchaOk) {
      return new Response(JSON.stringify({ ok: false, message: "Captcha inválido, intenta otra vez" }), { status: 400 });
    }

    // SMTP + Email
    const CONTACT_TO_EMAIL = env("CONTACT_TO_EMAIL");
    const { transporter, SMTP_USER } = createTransporter();

    await transporter.verify();

    const { subject, text, html } = buildEmailTemplate({ fullName, phone, email, comment });

    await transporter.sendMail({
      from: `"Voxidata Web" <${SMTP_USER}>`,
      to: CONTACT_TO_EMAIL,
      replyTo: email,
      subject,
      text,
      html,
    });

    return new Response(JSON.stringify({ ok: true, message: "Mensaje enviado correctamente" }), { status: 200 });
  } catch (e: any) {
    console.error("Error /api/contact:", e?.message || e, e);
    return new Response(
      JSON.stringify({ ok: false, message: "No se pudo enviar el correo. Revisa logs/SMTP." }),
      { status: 500 }
    );
  }
};
