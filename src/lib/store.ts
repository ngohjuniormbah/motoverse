import nodemailer from "nodemailer";
export async function notifyAdmin(subject: string, lines: string[]) {
  const { SMTP_USER, SMTP_PASS, ADMIN_EMAIL } = process.env;
  if (!SMTP_USER || !SMTP_PASS) { console.log("[email not configured]", subject); return; }
  const t = nodemailer.createTransport({ host: "smtp.gmail.com", port: 587, secure: false, auth: { user: SMTP_USER, pass: SMTP_PASS } });
  await t.sendMail({ from: `Motoverse <${SMTP_USER}>`, to: ADMIN_EMAIL || SMTP_USER, subject, text: lines.join("\n") });
}
