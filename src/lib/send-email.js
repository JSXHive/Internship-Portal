// // lib/sendEmail.js
// import nodemailer from "nodemailer";

// const transporter = nodemailer.createTransport({
//   service: "gmail", // or your email provider
//   auth: {
//     user: process.env.EMAIL_USER, // your Gmail address
//     pass: process.env.EMAIL_PASS, // app password if 2FA enabled
//   },
// });

// export default async function sendEmail(to, subject, text) {
//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to,
//     subject,
//     text,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log("Email sent to:", to);
//   } catch (err) {
//     console.error("Error sending email:", err);
//     throw err;
//   }
// }


// lib/send-email.js
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendEmail(to, subject, text) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent to:", to);
    return { success: true };
  } catch (err) {
    console.error("Error sending email:", err);
    throw err;
  }
}

// Export both default and named
export default sendEmail;
export { sendEmail };