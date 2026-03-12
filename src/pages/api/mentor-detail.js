import { pool } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    // First check if the user has a mentor assigned
    const applicationQuery = `
      SELECT mentor FROM applications 
      WHERE user_id = $1 AND mentor IS NOT NULL
    `;
    
    const applicationResult = await pool.query(applicationQuery, [userId]);
    
    if (applicationResult.rows.length === 0) {
      return res.status(404).json({ 
        message: 'No mentor assigned yet' 
      });
    }

    const mentorId = applicationResult.rows[0].mentor;

    // Fetch mentor details from mentor_profiles table
    const mentorQuery = `
      SELECT 
        user_id as mentor_user_id,
        name as mentor_name,
        email as mentor_email,
        contact_no as mentor_contact,
        designation as mentor_designation,
        area_of_expertise,
        years_of_experience,
        bio,
        profile_photo
      FROM mentor_profiles 
      WHERE user_id = $1
    `;
    
    const mentorResult = await pool.query(mentorQuery, [mentorId]);
    
    if (mentorResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Mentor details not found' 
      });
    }

    res.status(200).json(mentorResult.rows[0]);
  } catch (error) {
    console.error('Error fetching mentor details:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
}