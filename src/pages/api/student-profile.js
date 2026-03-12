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
    const client = await pool.connect();

    // Get student profile with student_id and profile_photo
    const query = `
      SELECT 
        u.student_id,
        u.user_id,
        u.name,
        u.email,
        sp.profile_photo,
        sp.phone,
        sp.college,
        sp.branch
      FROM users u
      LEFT JOIN student_profiles sp ON u.user_id = sp.user_id
      WHERE u.user_id = $1
    `;

    const result = await client.query(query, [userId]);
    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const studentData = result.rows[0];
    
    res.status(200).json({
      student_id: studentData.student_id || studentData.user_id,
      profile_photo: studentData.profile_photo,
      name: studentData.name,
      email: studentData.email,
      phone: studentData.phone,
      college: studentData.college,
      branch: studentData.branch
    });

  } catch (error) {
    console.error('Error fetching student profile:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}