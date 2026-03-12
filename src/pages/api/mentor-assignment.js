// pages/api/mentor-assignment.js
// import { pool } from '../../../lib/db';
import { pool } from "@/lib/db";

export default async function handler(req, res) {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    // Check if the user has an accepted application with a mentor assigned
    const applicationQuery = `
      SELECT a.*, m.name as mentor_name, m.email as mentor_email, 
             m.contact_no as mentor_contact, m.designation as mentor_designation,
             m.area_of_expertise, m.years_of_experience, m.bio, m.profile_photo
      FROM applications a
      LEFT JOIN mentor_profiles m ON a.mentor = m.user_id
      WHERE a.user_id = $1 AND a.status = 'accepted' AND a.mentor IS NOT NULL
    `;

    const result = await pool.query(applicationQuery, [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No mentor assigned or application not accepted' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching mentor assignment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}