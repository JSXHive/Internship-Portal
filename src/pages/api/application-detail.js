import { pool } from '../../../lib/db';

export default async function handler(req, res) {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    // Query the applications table to get application details
    const result = await pool.query(
      `SELECT 
        application_id, 
        user_id, 
        full_name, 
        email, 
        contact, 
        college, 
        branch, 
        year_of_study, 
        cgpa, 
        areas_of_interest, 
        duration_months, 
        start_date, 
        end_date, 
        resume_url, 
        created_at, 
        status, 
        mentor,
        updated_at
      FROM applications 
      WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching application details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}