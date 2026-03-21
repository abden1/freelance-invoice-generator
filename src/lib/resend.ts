import { Resend } from "resend";

// Lazy initialization to avoid build-time errors when API key is missing
export function getResend(): Resend {
  return new Resend(process.env.RESEND_API_KEY || "re_placeholder");
}

const FROM = process.env.EMAIL_FROM || "noreply@freelancepro.app";

interface InvoiceEmailData {
  to: string;
  clientName: string;
  invoiceNumber: string;
  amount: string;
  dueDate: string;
  paymentUrl?: string;
  pdfBuffer?: Buffer;
  fromName?: string;
}

interface ReminderEmailData {
  to: string;
  clientName: string;
  invoiceNumber: string;
  amount: string;
  dueDate: string;
  daysOverdue?: number;
  paymentUrl?: string;
}

interface ContractEmailData {
  to: string;
  clientName: string;
  contractTitle: string;
  signingUrl: string;
  fromName?: string;
}

export async function sendInvoiceEmail({
  to,
  clientName,
  invoiceNumber,
  amount,
  dueDate,
  paymentUrl,
  pdfBuffer,
  fromName = "FreelancePro",
}: InvoiceEmailData) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"/></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="background: #4F46E5; padding: 32px 40px;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Invoice ${invoiceNumber}</h1>
        </div>
        <div style="padding: 40px;">
          <p style="color: #374151; font-size: 16px;">Hi ${clientName},</p>
          <p style="color: #374151;">Please find your invoice attached. Here are the details:</p>
          <div style="background: #f3f4f6; border-radius: 8px; padding: 24px; margin: 24px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="color: #6b7280; padding: 8px 0;">Invoice Number</td><td style="color: #111827; font-weight: 600; text-align: right;">${invoiceNumber}</td></tr>
              <tr><td style="color: #6b7280; padding: 8px 0;">Amount Due</td><td style="color: #111827; font-weight: 600; text-align: right; font-size: 20px;">${amount}</td></tr>
              <tr><td style="color: #6b7280; padding: 8px 0;">Due Date</td><td style="color: #111827; font-weight: 600; text-align: right;">${dueDate}</td></tr>
            </table>
          </div>
          ${paymentUrl ? `<a href="${paymentUrl}" style="display: inline-block; background: #4F46E5; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Pay Now</a>` : ""}
          <p style="color: #6b7280; font-size: 14px; margin-top: 32px;">If you have any questions, please don't hesitate to reach out.</p>
          <p style="color: #374151;">Thank you,<br/><strong>${fromName}</strong></p>
        </div>
      </div>
    </body>
    </html>
  `;

  const attachments = pdfBuffer
    ? [{ filename: `invoice-${invoiceNumber}.pdf`, content: pdfBuffer }]
    : [];

  return getResend().emails.send({
    from: `${fromName} <${FROM}>`,
    to,
    subject: `Invoice ${invoiceNumber} — ${amount} due ${dueDate}`,
    html,
    attachments,
  });
}

export async function sendReminderEmail({
  to,
  clientName,
  invoiceNumber,
  amount,
  dueDate,
  daysOverdue,
  paymentUrl,
}: ReminderEmailData) {
  const isOverdue = daysOverdue !== undefined && daysOverdue > 0;
  const subject = isOverdue
    ? `OVERDUE: Invoice ${invoiceNumber} is ${daysOverdue} days overdue`
    : `Reminder: Invoice ${invoiceNumber} is due soon`;

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="background: ${isOverdue ? "#EF4444" : "#F59E0B"}; padding: 32px 40px;">
          <h1 style="color: white; margin: 0; font-size: 24px;">${isOverdue ? "⚠️ Overdue Invoice" : "Payment Reminder"}</h1>
        </div>
        <div style="padding: 40px;">
          <p>Hi ${clientName},</p>
          <p>${isOverdue ? `Your invoice ${invoiceNumber} is <strong>${daysOverdue} days overdue</strong>. Please arrange payment as soon as possible.` : `This is a friendly reminder that invoice ${invoiceNumber} is due on ${dueDate}.`}</p>
          <div style="background: #f3f4f6; border-radius: 8px; padding: 24px; margin: 24px 0;">
            <p style="margin: 0;"><strong>Invoice:</strong> ${invoiceNumber}</p>
            <p style="margin: 8px 0;"><strong>Amount:</strong> ${amount}</p>
            <p style="margin: 0;"><strong>Due Date:</strong> ${dueDate}</p>
          </div>
          ${paymentUrl ? `<a href="${paymentUrl}" style="display: inline-block; background: #4F46E5; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">Pay Now</a>` : ""}
        </div>
      </div>
    </body>
    </html>
  `;

  return getResend().emails.send({ from: FROM, to, subject, html });
}

export async function sendContractEmail({
  to,
  clientName,
  contractTitle,
  signingUrl,
  fromName = "FreelancePro",
}: ContractEmailData) {
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="background: #4F46E5; padding: 32px 40px;">
          <h1 style="color: white; margin: 0; font-size: 24px;">📝 Contract Ready to Sign</h1>
        </div>
        <div style="padding: 40px;">
          <p>Hi ${clientName},</p>
          <p><strong>${fromName}</strong> has sent you a contract for review and signature.</p>
          <div style="background: #f3f4f6; border-radius: 8px; padding: 24px; margin: 24px 0;">
            <p style="margin: 0;"><strong>${contractTitle}</strong></p>
          </div>
          <a href="${signingUrl}" style="display: inline-block; background: #4F46E5; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Review & Sign Contract</a>
          <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">This link is unique to you. Please do not share it with others.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return getResend().emails.send({
    from: `${fromName} <${FROM}>`,
    to,
    subject: `Please sign: ${contractTitle}`,
    html,
  });
}
