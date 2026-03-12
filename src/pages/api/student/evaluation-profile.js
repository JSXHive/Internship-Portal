// pages/api/student/evaluation-profile.js (Simplified)
// import { pool } from '../../../../lib/db';
import { pool } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    // Get user data from users table
    const userQuery = `
      SELECT user_id, name, email, student_id, user_role 
      FROM users 
      WHERE user_id = $1
    `;
    const userResult = await pool.query(userQuery, [userId]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userData = userResult.rows[0];

    // Try to get additional data from student_profiles
    let additionalData = {};
    try {
      const profileQuery = `
        SELECT college, branch, year_of_study, phone
        FROM student_profiles 
        WHERE user_id = $1
      `;
      const profileResult = await pool.query(profileQuery, [userId]);
      
      if (profileResult.rows.length > 0) {
        additionalData = profileResult.rows[0];
      }
    } catch (error) {
      console.warn('Could not fetch student profile:', error.message);
    }

    // Combine data
    const studentInfo = {
      full_name: userData.name,
      email: userData.email,
      student_id: userData.student_id || userData.user_id,
      college: additionalData.college || 'Not specified',
      branch: additionalData.branch || 'Not specified',
      year_of_study: additionalData.year_of_study || 'Not specified',
      phone: additionalData.phone || 'Not specified',
      user_role: userData.user_role
    };

    res.status(200).json(studentInfo);
  } catch (error) {
    console.error('Error fetching student evaluation profile:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
}