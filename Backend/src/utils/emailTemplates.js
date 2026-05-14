export const otpTemplate = (otp, name) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 20px">
      <table role="presentation" style="max-width:480px;width:100%" cellpadding="0" cellspacing="0">
        <tr><td style="background:linear-gradient(135deg,#6366f1,#06b6d4);border-radius:20px 20px 0 0;padding:32px;text-align:center">
          <div style="font-size:2.5rem;margin-bottom:8px">🔐</div>
          <h1 style="color:#fff;margin:0;font-size:1.5rem;font-weight:700">Verify Your Email</h1>
          <p style="color:rgba(255,255,255,0.7);margin:8px 0 0;font-size:0.95rem">Welcome to ExTrackify${name ? `, ${name}` : ''}!</p>
        </td></tr>
        <tr><td style="background:#1a1a2e;border-radius:0 0 20px 20px;padding:32px">
          <p style="color:rgba(255,255,255,0.6);font-size:0.95rem;margin:0 0 24px;line-height:1.6">
            Use the OTP below to verify your email address. This code expires in <strong style="color:#818cf8">5 minutes</strong>.
          </p>
          <div style="background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.15);border-radius:16px;padding:24px;text-align:center;margin-bottom:24px">
            <div style="font-size:2.5rem;font-weight:800;letter-spacing:12px;color:#fff;font-family:'Courier New',monospace">${otp}</div>
          </div>
          <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:20px;margin-bottom:24px">
            <p style="color:rgba(255,255,255,0.4);font-size:0.82rem;margin:0;line-height:1.6">
              ⚠️ If you didn't request this, please ignore this email. Never share your OTP with anyone.
            </p>
          </div>
          <p style="color:rgba(255,255,255,0.25);font-size:0.75rem;margin:0;text-align:center">
            ExTrackify — Track Every Rupee
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

export const welcomeTemplate = (name) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 20px">
      <table role="presentation" style="max-width:480px;width:100%" cellpadding="0" cellspacing="0">
        <tr><td style="background:linear-gradient(135deg,#6366f1,#06b6d4);border-radius:20px 20px 0 0;padding:32px;text-align:center">
          <div style="font-size:2.5rem;margin-bottom:8px">🎉</div>
          <h1 style="color:#fff;margin:0;font-size:1.5rem;font-weight:700">Welcome to ExTrackify!</h1>
        </td></tr>
        <tr><td style="background:#1a1a2e;border-radius:0 0 20px 20px;padding:32px">
          <p style="color:rgba(255,255,255,0.7);font-size:0.95rem;margin:0 0 8px;line-height:1.6">
            Hey <strong style="color:#fff">${name}</strong>,
          </p>
          <p style="color:rgba(255,255,255,0.6);font-size:0.95rem;margin:0 0 24px;line-height:1.6">
            You're all set! Start managing your finances like a pro.
          </p>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px">
            ${[
              ['📊', 'Track Expenses', 'Monitor every rupee'],
              ['🎯', 'Set Goals', 'Save smarter'],
              ['📈', 'SIP Tracker', 'Grow investments'],
              ['🔔', 'Bill Reminders', 'Never miss a payment'],
            ].map(([icon, title, desc]) => `
              <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:16px;text-align:center">
                <div style="font-size:1.5rem;margin-bottom:4px">${icon}</div>
                <div style="color:#fff;font-weight:600;font-size:0.88rem">${title}</div>
                <div style="color:rgba(255,255,255,0.35);font-size:0.75rem">${desc}</div>
              </div>
            `).join('')}
          </div>
          <a href="${process.env.FRONTEND_URL || 'https://ex-trackify.vercel.app'}/dashboard" style="display:block;text-align:center;background:linear-gradient(135deg,#6366f1,#06b6d4);color:#fff;text-decoration:none;padding:14px 24px;border-radius:12px;font-weight:600;font-size:1rem;margin-bottom:24px">
            Go to Dashboard →
          </a>
          <p style="color:rgba(255,255,255,0.25);font-size:0.75rem;margin:0;text-align:center">
            ExTrackify — Track Every Rupee
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

export const forgotPasswordTemplate = (resetLink) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 20px">
      <table role="presentation" style="max-width:480px;width:100%" cellpadding="0" cellspacing="0">
        <tr><td style="background:linear-gradient(135deg,#6366f1,#06b6d4);border-radius:20px 20px 0 0;padding:32px;text-align:center">
          <div style="font-size:2.5rem;margin-bottom:8px">🔑</div>
          <h1 style="color:#fff;margin:0;font-size:1.5rem;font-weight:700">Reset Your Password</h1>
        </td></tr>
        <tr><td style="background:#1a1a2e;border-radius:0 0 20px 20px;padding:32px">
          <p style="color:rgba(255,255,255,0.6);font-size:0.95rem;margin:0 0 24px;line-height:1.6">
            We received a request to reset your password. Click the button below to set a new one. This link expires in <strong style="color:#818cf8">1 hour</strong>.
          </p>
          <a href="${resetLink}" style="display:block;text-align:center;background:linear-gradient(135deg,#6366f1,#06b6d4);color:#fff;text-decoration:none;padding:14px 24px;border-radius:12px;font-weight:600;font-size:1rem;margin-bottom:24px">
            Reset Password →
          </a>
          <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:20px;margin-bottom:24px">
            <p style="color:rgba(255,255,255,0.4);font-size:0.82rem;margin:0;line-height:1.6">
              ⚠️ If you didn't request this password reset, please ignore this email. Your account is secure.
            </p>
          </div>
          <p style="color:rgba(255,255,255,0.25);font-size:0.75rem;margin:0;text-align:center">
            ExTrackify — Track Every Rupee
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
