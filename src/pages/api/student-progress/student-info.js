import { pool } from '../../../../lib/db';

export default async function handler(req, res) {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    // Get basic user info from multiple tables
    const userQuery = `
      SELECT 
        u.user_id, 
        u.name, 
        u.email, 
        u.student_id,
        sp.college, 
        sp.branch, 
        sp.year_of_study,
        a.start_date, 
        a.end_date, 
        a.mentor,
        m.name as mentor_name,
        a.status as application_status
      FROM users u
      LEFT JOIN student_profiles sp ON u.user_id = sp.user_id
      LEFT JOIN applications a ON u.user_id = a.user_id
      LEFT JOIN users m ON a.mentor = m.user_id
      WHERE u.user_id = $1
    `;
    
    const client = await pool.connect();
    try {
      const userResult = await client.query(userQuery, [userId]);
      
      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userData = userResult.rows[0];
      
      res.status(200).json({
        name: userData.name,
        student_id: userData.student_id,
        email: userData.email,
        college: userData.college,
        branch: userData.branch,
        year_of_study: userData.year_of_study,
        start_date: userData.start_date,
        end_date: userData.end_date,
        mentor: userData.mentor,
        mentor_name: userData.mentor_name,
        application_status: userData.application_status
      });
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Error fetching student info:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}