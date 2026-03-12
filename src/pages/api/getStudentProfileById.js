// pages/api/getStudentProfileById.js
import { pool } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: 'Student ID is required' });
  }

  try {
    const client = await pool.connect();
   
    // Query the student_profiles table with the correct column names
    const result = await client.query(
      `SELECT
        profile_id as id,
        user_id,
        profile_photo,
        name,
        email,
        dob,
        gender,
        phone,
        college,
        branch,
        cgpa,  // Changed from ggpa to cgpa
        year_of_study,
        about,
        skills,
        linkedin_url,
        github_url,
        resume,
        address,
        created_at,
        updated_at
       FROM student_profiles WHERE profile_id = $1 OR user_id = $1`,
      [id]
    );
   
    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}