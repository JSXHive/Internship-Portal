import { pool } from '../../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { studentId } = req.query;

  if (!studentId) {
    return res.status(400).json({ message: 'Student ID is required' });
  }

  try {
    // First get mentor name from applications table
    const applicationQuery = `
      SELECT mentor FROM applications 
      WHERE user_id = $1
    `;
    
    const applicationResult = await pool.query(applicationQuery, [studentId]);

    if (applicationResult.rows.length === 0 || !applicationResult.rows[0].mentor) {
      return res.status(404).json({ message: 'Student application or mentor not found' });
    }

    const mentorName = applicationResult.rows[0].mentor;

    // Then get detailed mentor info from mentor_profiles
    const mentorQuery = `
      SELECT * FROM mentor_profiles 
      WHERE name = $1 OR user_id = $1
    `;
    
    const mentorResult = await pool.query(mentorQuery, [mentorName]);

    if (mentorResult.rows.length === 0) {
      return res.status(404).json({ 
        message: 'Mentor details not found',
        basicInfo: { name: mentorName }
      });
    }

    res.status(200).json(mentorResult.rows[0]);
  } catch (error) {
    console.error('Error fetching mentor by student:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}