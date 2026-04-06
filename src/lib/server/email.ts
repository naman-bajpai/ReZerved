import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM = process.env.EMAIL_FROM || 'BookedUp <noreply@bookedup.app>';

export async function sendOtpEmail({
  to,
  name,
  code,
  businessName,
}: {
  to: string;
  name: string;
  code: string;
  businessName: string;
}) {
  const html = `
<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;background:#fafaf8;padding:40px 0;margin:0">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;padding:40px;border:1px solid #f0ede8">
    <div style="text-align:center;margin-bottom:28px">
      <div style="display:inline-flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,#f97316,#ec4899)">
        <span style="color:#fff;font-size:20px;font-weight:700">B</span>
      </div>
    </div>
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f0a1e;text-align:center">
      Verify your email
    </h2>
    <p style="margin:0 0 28px;color:#6b7280;text-align:center;font-size:14px">
      Hi ${name}, here's your code to book with <strong>${businessName}</strong>
    </p>
    <div style="background:#fafaf8;border-radius:12px;padding:24px;text-align:center;margin-bottom:28px;border:1px solid #f0ede8">
      <span style="font-size:36px;font-weight:700;letter-spacing:10px;color:#0f0a1e">${code}</span>
    </div>
    <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center">
      This code expires in 10 minutes. If you didn't request this, you can ignore this email.
    </p>
  </div>
</body>
</html>`;

  if (!resend) {
    // Dev fallback — log to console
    console.log(`[EMAIL DEV] OTP for ${to}: ${code}`);
    return;
  }

  await resend.emails.send({
    from: FROM,
    to,
    subject: `${code} — your BookedUp verification code`,
    html,
  });
}
