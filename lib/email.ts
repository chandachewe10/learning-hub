import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL || "noreply@learnhub.com";

export async function sendWelcomeEmail(to: string, name: string) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: "Welcome to LearnHub!",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <h1 style="color:#6366f1">Welcome to LearnHub, ${name}!</h1>
        <p>We're thrilled to have you join our learning community.</p>
        <p>Start exploring thousands of courses and take your skills to the next level.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/courses" style="background:#6366f1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:16px">Browse Courses</a>
        <p style="margin-top:32px;color:#666;font-size:14px">LearnHub — Learn. Grow. Succeed.</p>
      </div>
    `,
  });
}

export async function sendEnrollmentEmail(
  to: string,
  name: string,
  courseName: string,
  courseUrl: string
) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `You're enrolled in "${courseName}"`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <h1 style="color:#6366f1">Enrollment Confirmed!</h1>
        <p>Hi ${name}, you've successfully enrolled in <strong>${courseName}</strong>.</p>
        <a href="${courseUrl}" style="background:#6366f1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:16px">Start Learning</a>
      </div>
    `,
  });
}

export async function sendPaymentReceiptEmail(
  to: string,
  name: string,
  amount: number,
  currency: string,
  reference: string,
  description: string
) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: "Payment Confirmation — LearnHub",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <h1 style="color:#6366f1">Payment Received</h1>
        <p>Hi ${name}, your payment has been processed successfully.</p>
        <table style="width:100%;border-collapse:collapse;margin-top:16px">
          <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold">Amount</td><td style="padding:8px;border:1px solid #e5e7eb">${currency} ${amount}</td></tr>
          <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold">Reference</td><td style="padding:8px;border:1px solid #e5e7eb">${reference}</td></tr>
          <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold">Description</td><td style="padding:8px;border:1px solid #e5e7eb">${description}</td></tr>
        </table>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: "Reset your password — LearnHub",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <h1 style="color:#6366f1">Reset your password</h1>
        <p>Click the link below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetUrl}" style="background:#6366f1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:16px">Reset Password</a>
        <p style="margin-top:16px;color:#666;font-size:14px">If you didn't request this, please ignore this email.</p>
      </div>
    `,
  });
}

export async function sendInstructorApprovalEmail(to: string, name: string, approved: boolean) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: approved ? "Your instructor account is approved!" : "Instructor application update",
    html: approved
      ? `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
          <h1 style="color:#6366f1">Congratulations, ${name}!</h1>
          <p>Your instructor account has been approved. You can now create and publish courses.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/instructor/dashboard" style="background:#6366f1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:16px">Go to Dashboard</a>
        </div>`
      : `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
          <h1 style="color:#6366f1">Application Update</h1>
          <p>Hi ${name}, unfortunately your instructor application was not approved at this time. Please contact support for more information.</p>
        </div>`,
  });
}
