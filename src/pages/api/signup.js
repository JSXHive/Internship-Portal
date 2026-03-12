// import { pool } from '../../../lib/db.js';
import { pool } from "@/lib/db";
import { verifyOTP } from '../../lib/otpUtils.js';

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { role, name, email, password, phone, otp } = req.body;

    console.log('Signup request:', { role, name, email, otp });

    if (!role || !name || !email || !otp) {
      return res.status(400).json({ error: "Role, name, email, and OTP are required" });
    }

    const validRoles = ["student", "mentor", "admin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role specified" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Email domain validation for mentors - REMOVED THE @gov.in RESTRICTION
    // if (role === "mentor") {
    //   const allowedDomain = "gov.in";
    //   const emailDomain = normalizedEmail.split('@')[1];
    //   
    //   if (emailDomain !== allowedDomain) {
    //     return res.status(400).json({ 
    //       error: `Mentors must use ${allowedDomain} email addresses` 
    //     });
    //   }
    // }

    // Verify OTP
    const otpVerification = await verifyOTP(normalizedEmail, otp, 'signup');
    console.log('OTP verification result:', otpVerification);
    
    if (!otpVerification.isValid) {
      return res.status(400).json({ error: otpVerification.message });
    }

    // Check if email already exists
    const existingUser = await pool.query(
      "SELECT user_id FROM public.users WHERE email = $1",
      [normalizedEmail]
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Use plain password (no hashing)
    const plainPassword = password || '';

    let userId;

    if (role === "admin") {
      const prefix = "ADMIN";
      const lastRes = await pool.query(
        "SELECT user_id FROM public.users WHERE user_id LIKE $1 ORDER BY LENGTH(user_id), user_id DESC LIMIT 1",
        [`${prefix}%`]
      );
      let nextNum = 1;
      if (lastRes.rows.length > 0) {
        const numPart = parseInt(lastRes.rows[0].user_id.replace(prefix, ""), 10);
        if (!isNaN(numPart)) nextNum = numPart + 1;
      }
      userId = `${prefix}${String(nextNum).padStart(3, "0")}`;
    } else if (role === "mentor") {
      const prefix = "MENTOR";
      const lastRes = await pool.query(
        "SELECT user_id FROM public.users WHERE user_id LIKE $1 ORDER BY LENGTH(user_id), user_id DESC LIMIT 1",
        [`${prefix}%`]
      );
      let nextNum = 1;
      if (lastRes.rows.length > 0) {
        const numPart = parseInt(lastRes.rows[0].user_id.replace(prefix, ""), 10);
        if (!isNaN(numPart)) nextNum = numPart + 1;
      }
      userId = `${prefix}${String(nextNum).padStart(3, "0")}`;
    } else {
      // Students: numeric user_id only (1, 2, 3, etc.)
      const lastStudentRes = await pool.query(
        "SELECT user_id FROM public.users WHERE user_role = 'student' AND user_id ~ '^[0-9]+$' ORDER BY CAST(user_id AS INTEGER) DESC LIMIT 1"
      );
      let nextId = 1;
      if (lastStudentRes.rows.length > 0) {
        const lastId = parseInt(lastStudentRes.rows[0].user_id, 10);
        if (!isNaN(lastId)) nextId = lastId + 1;
      }
      userId = String(nextId); // Just numbers: 1, 2, 3, etc.
      // Note: student_id is left null/blank as requested
    }

    console.log('Generated user ID:', userId);

    // Insert user into DB with OTP reference - student_id is NOT included in the insert
    await pool.query(
      `INSERT INTO public.users (user_id, user_role, name, email, password, phone, otp_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [userId, role, name.trim(), normalizedEmail, plainPassword, phone || null, otpVerification.otpId]
    );

    console.log('User inserted successfully with blank student_id');

    // For response, include mentor_id if role is mentor
    const responseData = {
      message: "Signup successful",
      user_id: userId,
      role: role,
      name: name.trim(),
      email: normalizedEmail
    };

    // Add role-specific IDs to response
    if (role === "mentor") {
      responseData.mentor_id = userId; // Using the MENTOR001 format as the mentor_id
    } else if (role === "student") {
      // For students, we don't include student_id as it's blank
      responseData.student_id = null;
    }

    return res.status(201).json(responseData);

  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({
      error: "Server error",
      details: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
}