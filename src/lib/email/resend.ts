import { Resend } from 'resend';

function getResendClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key || key.startsWith('re_...')) return null;
  return new Resend(key);
}

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || 'Top Glass Window Tint <bookings@topglasswindowtint.com>';

export async function sendBookingConfirmationEmail(params: {
  to: string;
  customerName: string;
  vehicleLabel: string;
  locationName: string;
  locationAddress: string;
  startsAtFormatted: string;
  totalFormatted: string;
  depositFormatted: string;
  balanceFormatted: string;
  manageUrl: string;
}) {
  const resend = getResendClient();
  const html = `
    <div style="font-family: Inter, -apple-system, sans-serif; background: #F4F1EC; color: #16181B; padding: 32px;">
      <div style="max-width: 560px; margin: 0 auto; background: #FAF8F4; border: 1px solid #DAD5CC; border-radius: 12px; padding: 32px;">
        <p style="font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: #1F4E5A; margin: 0 0 8px;">Top Glass Window Tint</p>
        <h1 style="font-family: Georgia, serif; font-size: 28px; margin: 0 0 16px;">Your bay is reserved, ${params.customerName}.</h1>
        <p style="color: #6B6A66; margin: 0 0 24px;">We've received your ${params.depositFormatted} deposit for your ${params.vehicleLabel}.</p>
        <div style="border-top: 1px solid #DAD5CC; border-bottom: 1px solid #DAD5CC; padding: 16px 0; margin-bottom: 24px;">
          <p style="margin: 0 0 8px;"><strong>Studio:</strong> ${params.locationName}</p>
          <p style="margin: 0 0 8px;"><strong>Address:</strong> ${params.locationAddress}</p>
          <p style="margin: 0 0 8px;"><strong>Appointment:</strong> ${params.startsAtFormatted}</p>
          <p style="margin: 0 0 8px;"><strong>Total:</strong> ${params.totalFormatted} &middot; <strong>Balance due at pickup:</strong> ${params.balanceFormatted}</p>
        </div>
        <a href="${params.manageUrl}" style="display: inline-block; background: #1F4E5A; color: #FFFFFF; text-decoration: none; padding: 12px 20px; border-radius: 12px; font-weight: 500;">Manage or reschedule appointment</a>
      </div>
    </div>
  `;

  if (!resend) {
    console.info('[Email Mock] Booking confirmation to:', params.to, params.manageUrl);
    return { mocked: true };
  }

  return resend.emails.send({
    from: FROM_EMAIL,
    to: params.to,
    subject: `Appointment Confirmed — ${params.vehicleLabel} (${params.locationName})`,
    html,
  });
}

export async function sendSavedQuoteEmail(params: {
  to: string;
  vehicleLabel: string;
  totalFormatted: string;
  quoteUrl: string;
  isWaitlist?: boolean;
}) {
  const resend = getResendClient();
  const subject = params.isWaitlist
    ? `You're on the Salt Lake City Waitlist — ${params.vehicleLabel}`
    : `Your Exact Tint Quote — ${params.vehicleLabel}`;

  const html = `
    <div style="font-family: Inter, -apple-system, sans-serif; background: #F4F1EC; color: #16181B; padding: 32px;">
      <div style="max-width: 560px; margin: 0 auto; background: #FAF8F4; border: 1px solid #DAD5CC; border-radius: 12px; padding: 32px;">
        <p style="font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: #1F4E5A; margin: 0 0 8px;">Top Glass Window Tint</p>
        <h1 style="font-family: Georgia, serif; font-size: 26px; margin: 0 0 12px;">Your quote is saved.</h1>
        <p style="color: #6B6A66; margin: 0 0 24px;">Vehicle: <strong>${params.vehicleLabel}</strong> &middot; Total: <strong>${params.totalFormatted}</strong></p>
        <a href="${params.quoteUrl}" style="display: inline-block; background: #1F4E5A; color: #FFFFFF; text-decoration: none; padding: 12px 20px; border-radius: 12px; font-weight: 500;">Open your quote</a>
      </div>
    </div>
  `;

  if (!resend) {
    console.info('[Email Mock] Saved quote email to:', params.to, params.quoteUrl);
    return { mocked: true };
  }

  return resend.emails.send({
    from: FROM_EMAIL,
    to: params.to,
    subject,
    html,
  });
}
