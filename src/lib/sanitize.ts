// src/lib/sanitize.ts
export function normalizeSmtpPass(pass: string) {
  return pass.replace(/\s+/g, ""); // Gmail App Password puede venir con espacios
}

export function escapeHtml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
