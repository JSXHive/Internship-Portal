import { pool } from '../../../lib/db'; // ✅ Fixed import

export default async function handler(req, res) {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    // Updated query to use correct column names from your schema
    const userQuery = `
      SELECT 
        u.user_id,
        u.name,
        u.email,
        u.user_role,
        u.student_id as student_number,
        u.application_status,
        COALESCE(sp.college, a.college) as college,
        COALESCE(sp.branch, a.branch) as branch,
        COALESCE(sp.year_of_study, a.year_of_study) as year_of_study
      FROM users u
      LEFT JOIN student_profiles sp ON u.user_id = sp.user_id
      LEFT JOIN applications a ON u.user_id = a.user_id
      WHERE u.user_id = $1
    `;

    const result = await pool.query(userQuery, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}