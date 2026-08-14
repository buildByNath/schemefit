import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

interface SchemeNotificationProps {
  toEmail: string;
  userName: string;
  schemeTitle: string;
  providerType: 'Government' | 'NGO' | 'Private Sector';
  benefitAmount: number;
  deadline: string;
  portalUrl?: string;
}

export async function sendSchemeEmailNotification({
  toEmail,
  userName,
  schemeTitle,
  providerType,
  benefitAmount,
  deadline,
  portalUrl = 'https://schemefit.com/dashboard',
}: SchemeNotificationProps) {
  try {
    const mailOptions = {
      from: `"Scheme Fit Alerts" <${process.env.GMAIL_USER}>`,
      to: toEmail,
      subject: `🎯 New Scheme Matched: ${schemeTitle} | Scheme Fit Alert`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 32px 16px; color: #0f172a;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
            
            <!-- Brand Header -->
            <div style="background-color: #0f172a; padding: 24px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.5px;">Scheme Fit</h1>
              <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 13px;">Smart Eligibility & Document Fulfillment</p>
            </div>

            <!-- Content Area -->
            <div style="padding: 32px 24px;">
              <p style="font-size: 16px; margin: 0 0 16px 0; color: #334155;">Hello <strong>${userName}</strong>,</p>
              
              <p style="font-size: 15px; line-height: 1.6; margin: 0 0 24px 0; color: #475569;">
                Our real-time matching engine has identified an eligible welfare/scholarship program tailored to your profile credentials.
              </p>

              <!-- Scheme Detail Card -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <span style="display: inline-block; background-color: #e0f2fe; color: #0369a1; font-size: 12px; font-weight: 600; padding: 4px 8px; border-radius: 4px; margin-bottom: 8px;">
                  ${providerType}
                </span>
                <h2 style="font-size: 18px; margin: 4px 0 12px 0; color: #0f172a; font-weight: 600;">
                  ${schemeTitle}
                </h2>
                
                <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #334155;">
                  <tr>
                    <td style="padding: 6px 0; color: #64748b;">Direct Financial Benefit:</td>
                    <td style="padding: 6px 0; font-weight: 600; text-align: right; color: #16a34a;">₹${benefitAmount.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748b;">Application Deadline:</td>
                    <td style="padding: 6px 0; font-weight: 500; text-align: right;">${deadline}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748b;">Vault Document Status:</td>
                    <td style="padding: 6px 0; font-weight: 500; text-align: right; color: #2563eb;">Pre-Verified & Ready</td>
                  </tr>
                </table>
              </div>

              <!-- Action Notice -->
              <p style="font-size: 14px; line-height: 1.5; color: #64748b; margin: 0 0 24px 0;">
                Your application documents have been pre-formatted. Log in to your Scheme Fit portal to generate your submission pack and claim your entitlement.
              </p>

              <!-- Call to Action Button -->
              <div style="text-align: center; margin-bottom: 12px;">
                <a href="${portalUrl}" 
                   style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block;">
                  Log In & Claim Scheme
                </a>
              </div>
            </div>

            <!-- Footer -->
            <div style="background-color: #f1f5f9; padding: 16px 24px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                © 2026 Scheme Fit. Automated Statutory Benefit Fulfillment.
              </p>
            </div>

          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('Email Dispatch Error:', error);
    return { success: false, error: error.message };
  }
}
