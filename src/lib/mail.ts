import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD, // Use an App Password, not your normal password
    },
});

export async function sendLifeReportEmail(to: string, userName: string, reportContent: any, pdfBuffer?: Buffer) {
    const mailOptions: any = {
        from: `"Chetna Astrology" <${process.env.GMAIL_USER}>`,
        to: to,
        subject: `Your Premium Life Guidance Report - ${userName}`,
        html: `
            <div style="font-family: serif; color: #101010; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #d4af37; border-radius: 8px;">
                <h1 style="color: #d4af37; text-align: center;">CHETNA</h1>
                <p>Namaste <b>${userName}</b>,</p>
                <p>Your Premium Life Guidance Report is now ready. Below is a summary of your cosmic journey.</p>
                
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                
                <h2 style="color: #d4af37;">1. Your Soul's Calling</h2>
                <p>${reportContent.chapter1_SoulPurpose.substring(0, 300)}...</p>
                
                <h2 style="color: #d4af37;">2. The Next 12 Months</h2>
                <p>${reportContent.chapter5_YearlyHorizon.substring(0, 300)}...</p>
                
                <p style="font-size: 1.1rem; color: #d4af37; text-align: center; margin: 20px 0;">
                    <b>Plus 8 more deep chapters on Career, Love, Health, Strengths, and Practical Remedies.</b>
                </p>
                
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                
                <div style="background: #fdfaf0; padding: 20px; border-radius: 8px; text-align: center;">
                    <p><b>Your professional 10-page PDF report is attached to this email.</b></p>
                    <p style="font-size: 0.9rem; color: #666;">
                        You can also view the full interactive report and download it anytime from your dashboard.
                    </p>
                </div>

                <div style="text-align: center; margin-top: 30px;">
                    <a href="${process.env.NEXTAUTH_URL}/profile" style="background: #d4af37; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block;">Login to Dashboard</a>
                </div>
                
                <p style="margin-top: 40px; font-size: 0.8rem; color: #999; text-align: center; font-style: italic;">
                    "Awareness, not prediction."
                </p>
            </div>
        `,
    };

    if (pdfBuffer) {
        mailOptions.attachments = [{
            filename: `Chetna_Life_Report_${userName}.pdf`,
            content: pdfBuffer
        }];
    }

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully with PDF to ${to}`);
        return { success: true };
    } catch (error) {
        console.error('Email sending error:', error);
        return { success: false, error };
    }
}
