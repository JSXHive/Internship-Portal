// import { pool } from '../../../lib/db.js';
import { pool } from "@/lib/db";
import { generateOTP, storeOTP, checkRecentOTP } from '../../../lib/otpUtils.js';
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { channel, recipient, purpose = 'signup' } = req.body;

    console.log('Send OTP request:', { channel, recipient, purpose });

    // ✅ Validate required fields
    if (!channel || !recipient) {
      return res.status(400).json({ error: 'Channel and recipient are required' });
    }

    // ✅ Validate channel
    if (!['email', 'sms'].includes(channel)) {
      return res.status(400).json({ error: 'Channel must be email or sms' });
    }

    // ✅ Prevent OTP spam
    const recentOTP = await checkRecentOTP(recipient, purpose);
    if (recentOTP) {
      return res.status(429).json({
        error: 'Please wait before requesting another OTP',
      });
    }

    // ✅ Generate OTP and store in database
    const otp = generateOTP();
    const otpId = await storeOTP(channel, recipient, purpose, otp);

    console.log('OTP stored with ID:', otpId);

    // ✅ Send OTP via email
    if (channel === 'email') {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: false, // TLS
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        tls: { rejectUnauthorized: false },
      });

      // Verify transporter
      await transporter.verify();

      const mailOptions = {
        from: `"Internship Portal" <${process.env.EMAIL_USER}>`,
        to: recipient,
        subject: 'Your OTP Verification Code',
        text: `Your OTP verification code is: ${otp}. It expires in 10 minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2D3748;">Internship Portal - Email Verification</h2>
            <p>Your OTP verification code is:</p>
            <div style="background-color: #F7FAFC; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #2D3748; border-radius: 8px; margin: 20px 0;">
              ${otp}
            </div>
            <p style="color: #718096; font-size: 14px;">
              This code will expire in 10 minutes. If you didn't request this, please ignore this email.
            </p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log('OTP email sent to:', recipient);
    }

    // ✅ Log OTP in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`OTP for ${recipient}: ${otp}`);
    }

    return res.status(200).json({
      message: 'OTP sent successfully',
      otpId,
      otp: process.env.NODE_ENV === 'development' ? otp : undefined,
    });
  } catch (error) {
    console.error('Error in send-otp API:', error);

    if (error.code === 'ESOCKET') {
      return res.status(500).json({
        error: 'Email service connection failed. Check your email configuration.',
      });
    }

    if (error.code === 'EAUTH') {
      return res.status(500).json({
        error: 'Email authentication failed. Check your credentials or app password.',
      });
    }

    return res.status(500).json({
      error: 'Failed to send OTP. Please try again later.',
    });
  }
}