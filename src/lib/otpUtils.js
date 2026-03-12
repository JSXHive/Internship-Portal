// import pool from './db.js';
import { pool } from './db.js'

// Generate a 6-digit OTP
export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Check if user has requested OTP recently (within 1 minute)
export async function checkRecentOTP(recipient, purpose) {
  try {
    const result = await pool.query(
      `SELECT created_at FROM otps 
       WHERE recipient = $1 AND purpose = $2 AND created_at > NOW() - INTERVAL '1 minute'
       ORDER BY created_at DESC LIMIT 1`,
      [recipient, purpose]
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error('Error checking recent OTP:', error);
    throw error;
  }
}

// Store OTP in database
export async function storeOTP(channel, recipient, purpose, otp) {
  try {
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    
    const result = await pool.query(
      `INSERT INTO otps (otp, channel, recipient, purpose, expires_at, verified)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [otp, channel, recipient, purpose, expiresAt, false]
    );
    
    return result.rows[0].id;
  } catch (error) {
    console.error('Error storing OTP:', error);
    throw error;
  }
}

// Verify OTP from database
export async function verifyOTP(recipient, otp, purpose) {
  try {
    console.log('Verifying OTP for:', { recipient, otp, purpose });
    
    // First, clean up expired OTPs
    await pool.query(
      'DELETE FROM otps WHERE expires_at < NOW()'
    );

    const result = await pool.query(
      `SELECT id, expires_at, verified 
       FROM otps 
       WHERE recipient = $1 AND otp = $2 AND purpose = $3 AND verified = false`,
      [recipient, otp, purpose]
    );

    console.log('OTP query result:', result.rows);

    if (result.rows.length === 0) {
      // Check if OTP was already used
      const usedResult = await pool.query(
        `SELECT id FROM otps 
         WHERE recipient = $1 AND otp = $2 AND purpose = $3 AND verified = true`,
        [recipient, otp, purpose]
      );
      
      if (usedResult.rows.length > 0) {
        return { isValid: false, message: 'OTP has already been used' };
      }
      
      return { isValid: false, message: 'Invalid OTP' };
    }

    const otpRecord = result.rows[0];
    
    // Check if OTP has expired
    if (new Date() > new Date(otpRecord.expires_at)) {
      return { isValid: false, message: 'OTP has expired' };
    }

    // Mark OTP as verified
    await pool.query(
      'UPDATE otps SET verified = true WHERE id = $1',
      [otpRecord.id]
    );

    return { 
      isValid: true, 
      message: 'OTP verified successfully',
      otpId: otpRecord.id 
    };

  } catch (error) {
    console.error('Error verifying OTP:', error);
    return { isValid: false, message: 'Error verifying OTP' };
  }
}