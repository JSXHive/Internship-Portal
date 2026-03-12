// /pages/api/send-decision-email.js
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { email, name, status } = req.body;

  if (!email || !name || !status) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const subject =
      status === "accepted"
        ? "Your Internship Application Has Been Accepted"
        : "Your Internship Application Status";

    const text =
      status === "accepted"
        ? `Hello ${name},\n\nCongratulations! Your application has been accepted.\nWe look forward to working with you.`
        : `Hello ${name},\n\nThank you for applying. Unfortunately, your application could not be accepted at this time.\nPlease try again in the future.`;

    await transporter.sendMail({
      from: `"ITG Internship Portal" <${process.env.SMTP_USER}>`,
      to: email,
      subject,
      text,
    });

    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Email send error:", error);
    res.status(500).json({ message: "Failed to send email" });
  }
}
