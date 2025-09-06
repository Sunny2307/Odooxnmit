const nodemailer = require('nodemailer');
require('dotenv').config();

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendOTP(email, otp, type = 'verification') {
    try {
      const subject = type === 'verification' 
        ? 'TeamNest - Email Verification' 
        : 'TeamNest - Password Reset';

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">TeamNest</h2>
          <h3>${type === 'verification' ? 'Email Verification' : 'Password Reset'}</h3>
          <p>Your ${type === 'verification' ? 'verification' : 'reset'} code is:</p>
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #2563eb; font-size: 32px; margin: 0;">${otp}</h1>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <hr style="margin: 20px 0;">
          <p style="color: #6b7280; font-size: 12px;">TeamNest - Team Collaboration Platform</p>
        </div>
      `;

      const mailOptions = {
        from: `"TeamNest" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: subject,
        html: html,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  async sendNotification(email, subject, message) {
    try {
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">TeamNest</h2>
          <h3>${subject}</h3>
          <p>${message}</p>
          <hr style="margin: 20px 0;">
          <p style="color: #6b7280; font-size: 12px;">TeamNest - Team Collaboration Platform</p>
        </div>
      `;

      const mailOptions = {
        from: `"TeamNest" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `TeamNest - ${subject}`,
        html: html,
      };

      const result = await this.transporter.sendMail(mailOptions);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Notification email failed:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
