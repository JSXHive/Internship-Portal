import { pool } from '../../../lib/db.js';
import { verifyOTP } from '../../../lib/otpUtils.js';

// Helper to generate a random student user_id (numeric)
function generateStudentId() {
  return 'S' + Math.floor(10000 + Math.random() * 90000); // e.g., S12345
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { recipient, otp, purpose = 'signup', name } = req.body;

    // ✅ Validate required fields
    if (!recipient || !otp) {
      return res.status(400).json({ error: 'Recipient and OTP are required' });
    }

    // ✅ Verify OTP
    const verification = await verifyOTP(recipient, otp, purpose);
    if (!verification.isValid) {
      return res.status(400).json({ error: verification.message });
    }

    // ✅ Generate a student user_id
    const userId = generateStudentId();

    // ✅ Insert user into the database with OTP reference
    await pool.query(
      `INSERT INTO public.users (user_id, name, email, password, user_role, otp_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO UPDATE SET
         name = EXCLUDED.name,
         otp_id = EXCLUDED.otp_id`,
      [userId, name || 'Student', recipient, '', 'student', verification.otpId]
    );

    return res.status(200).json({
      message: 'OTP verified successfully. Account created!',
      user_id: userId,
    });

  } catch (error) {
    console.error('Error in verify-otp API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}