import { pool } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { mentorId } = req.query;

  console.log('Received mentorId:', mentorId);

  if (!mentorId || mentorId === 'undefined' || mentorId === 'null') {
    console.log('Invalid mentorId received');
    return res.status(400).json({ error: 'Valid Mentor ID is required' });
  }

  try {
    if (!pool) {
      console.error('Database pool is not available');
      return res.status(500).json({ error: 'Database connection failed' });
    }

    console.log('Querying database for mentor:', mentorId);

    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        SELECT 
          d.*,
          u.name as student_name,
          u.student_id,
          u.email as student_email,
          sp.profile_photo,  -- Correct column name from student_profiles table
          a.college as student_college,
          a.full_name,
          ment.name as mentor_name
        FROM deliverables d
        INNER JOIN users u ON d.user_id = u.user_id
        INNER JOIN applications a ON u.user_id = a.user_id
        LEFT JOIN student_profiles sp ON u.user_id = sp.user_id
        LEFT JOIN users ment ON a.mentor = ment.user_id
        WHERE a.mentor = $1
        ORDER BY 
          CASE 
            WHEN d.status = 'submitted' THEN 1
            WHEN d.status = 'reviewed' THEN 2
            WHEN d.status = 'approved' THEN 3
            WHEN d.status = 'rejected' THEN 4
            ELSE 5
          END,
          d.submission_date DESC
      `, [mentorId]);

      console.log(`Found ${result.rows.length} deliverables`);
      
      const deliverables = result.rows.map(row => ({
        id: row.id,
        submission_id: row.submission_id,
        user_id: row.user_id,
        student_id: row.student_id,
        student_name: row.student_name || row.full_name || 'Unknown Student',
        profile_picture: row.profile_photo,  // Map profile_photo to profile_picture in response
        submission_date: row.submission_date,
        remarks: row.remarks || '',
        file_paths: row.file_paths || [],
        status: row.status || 'submitted',
        marks: row.marks || null,
        feedback: row.feedback || '',
        reviewed_by: row.reviewed_by,
        reviewed_at: row.reviewed_at,
        created_at: row.created_at,
        updated_at: row.updated_at,
        student_college: row.student_college,
        mentor_name: row.mentor_name
      }));

      res.status(200).json(deliverables);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}