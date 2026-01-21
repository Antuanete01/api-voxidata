// src/lib/email-template.ts
import { escapeHtml } from "./sanitize";
import { normalizePhoneForLinks } from "./phone";

export function buildEmailTemplate(params: {
  fullName: string;
  phone: string;
  email: string;
  comment: string;
}) {
  const { fullName, phone, email, comment } = params;

  const { e164, wa } = normalizePhoneForLinks(phone, "51");
  const mailto = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent("Re: Contacto Voxidata")}`;
  const telLink = e164 ? `tel:${e164}` : "#";
  const waLink = wa
    ? `https://wa.me/${wa}?text=${encodeURIComponent(
        `Hola ${fullName}, te escribe Voxidata. Gracias por contactarnos. ¿En qué podemos ayudarte?`
      )}`
    : "#";

  const subject = `Nuevo contacto web: ${fullName}`;

  const text =
`Nuevo mensaje a Voxidata

Nombre: ${fullName}
Teléfono: ${phone}
Correo: ${email}

Comentario:
${comment}
`;

  const html = `
<div style="
  margin:0;padding:0;background:#0b1220;
  font-family:Inter,Segoe UI,Arial,sans-serif;
  color:#ffffff;
  -webkit-text-fill-color:#ffffff;
">
  <div style="max-width:720px;margin:0 auto;padding:28px 16px;">

    <div style="
      border-radius:20px;
      overflow:hidden;
      border:1px solid rgba(255,255,255,.10);
      background:rgba(255,255,255,.06);
    ">
      <div style="
        padding:18px 18px 12px;
        color:#ffffff;
        -webkit-text-fill-color:#ffffff;
      ">
        <div style="
          font-weight:900;
          font-size:18px;
          letter-spacing:.02em;
          line-height:1.2;
          margin-bottom:4px;
        ">
          Nuevo contacto desde la web
        </div>

        <div style="
          font-size:13px;
          line-height:1.4;
          color:rgba(255,255,255,.78);
          -webkit-text-fill-color:rgba(255,255,255,.78);
        ">
          Voxidata — Formulario de contacto
        </div>
      </div>

      <div style="padding:0 18px 16px;">
        <span style="
          display:inline-block;
          background:rgba(214,40,40,.14);
          border:1px solid rgba(214,40,40,.26);
          color:#ffffff;
          -webkit-text-fill-color:#ffffff;
          padding:6px 10px;
          border-radius:999px;
          font-size:12px;
          font-weight:800;
        ">
          Nueva consulta
        </span>
      </div>
    </div>

    <div style="margin-top:12px;">
      <a href="${mailto}" style="
        display:inline-block;margin:0 10px 10px 0;
        padding:12px 14px;border-radius:14px;
        background:rgba(255,255,255,.10);
        border:1px solid rgba(255,255,255,.16);
        color:#ffffff;
        -webkit-text-fill-color:#ffffff;
        text-decoration:none;font-weight:900;font-size:13px;
      ">
        Responder por correo
      </a>

      <a href="${waLink}" style="
        display:inline-block;margin:0 10px 10px 0;
        padding:12px 14px;border-radius:14px;
        background:linear-gradient(135deg,#22C55E,#16A34A);
        border:1px solid rgba(34,197,94,.35);
        color:#062C44;
        -webkit-text-fill-color:#062C44;
        text-decoration:none;font-weight:950;font-size:13px;
      ">
        WhatsApp
      </a>

      <a href="${telLink}" style="
        display:inline-block;
        padding:12px 14px;
        border-radius:14px;
        background:linear-gradient(135deg,#F4C430,#D62828);
        border:1px solid rgba(244,196,48,.35);
        color:#062C44;
        -webkit-text-fill-color:#062C44;
        text-decoration:none;
        font-weight:950;
        font-size:13px;
      ">
        Llamar
      </a>
    </div>

    <div style="
      margin-top:12px;border-radius:20px;overflow:hidden;
      border:1px solid rgba(255,255,255,.10);
      background:rgba(255,255,255,.06);
    ">
      <div style="
        padding:18px 18px 8px;
        color:#ffffff;
        -webkit-text-fill-color:#ffffff;
      ">
        <div style="font-weight:900;font-size:15px;margin-bottom:10px;">
          Datos del solicitante
        </div>

        <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:separate;border-spacing:0 10px;">
          <tr>
            <td style="width:140px;color:rgba(255,255,255,.70);-webkit-text-fill-color:rgba(255,255,255,.70);font-weight:800;font-size:12px;">
              Nombre
            </td>
            <td style="color:#ffffff;-webkit-text-fill-color:#ffffff;font-weight:900;font-size:14px;">
              ${escapeHtml(fullName)}
            </td>
          </tr>
          <tr>
            <td style="width:140px;color:rgba(255,255,255,.70);-webkit-text-fill-color:rgba(255,255,255,.70);font-weight:800;font-size:12px;">
              Teléfono
            </td>
            <td style="color:#ffffff;-webkit-text-fill-color:#ffffff;font-weight:900;font-size:14px;">
              ${escapeHtml(e164 || phone)}
            </td>
          </tr>
          <tr>
            <td style="width:140px;color:rgba(255,255,255,.70);-webkit-text-fill-color:rgba(255,255,255,.70);font-weight:800;font-size:12px;">
              Correo
            </td>
            <td style="color:#ffffff;-webkit-text-fill-color:#ffffff;font-weight:900;font-size:14px;">
              <a href="mailto:${encodeURIComponent(email)}" style="
                color:#F4C430;
                -webkit-text-fill-color:#F4C430;
                text-decoration:none;font-weight:900;
              ">
                ${escapeHtml(email)}
              </a>
            </td>
          </tr>
        </table>
      </div>

      <div style="padding:0 18px 18px;">
        <div style="
          color:rgba(255,255,255,.70);
          -webkit-text-fill-color:rgba(255,255,255,.70);
          font-weight:800;font-size:12px;margin-bottom:8px;
        ">
          Comentario
        </div>

        <div style="
          white-space:pre-wrap;
          background:rgba(0,0,0,.18);
          border:1px solid rgba(255,255,255,.10);
          border-radius:14px;
          padding:12px 12px;
          color:#ffffff;
          -webkit-text-fill-color:#ffffff;
          line-height:1.55;
        ">
          ${escapeHtml(comment)}
        </div>
      </div>
    </div>

    <div style="
      margin-top:14px;
      color:rgba(255,255,255,.62);
      -webkit-text-fill-color:rgba(255,255,255,.62);
      font-size:12px;line-height:1.5;text-align:center;
    ">
      Este mensaje fue generado automáticamente desde la web de Voxidata.
    </div>

  </div>
</div>
`;

  return { subject, text, html };
}
