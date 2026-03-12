import { pool } from '../../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { mentorId, date } = req.body;

    if (!mentorId || !date) {
      return res.status(400).json({ message: 'Mentor ID and date are required' });
    }

    // Get all students assigned to this mentor without attendance for the date
    const result = await pool.query(`
      INSERT INTO attendance (user_id, date, status, entry_time, exit_time, work_mode, is_late, is_auto_marked, created_at, updated_at)
      SELECT 
        u.user_id, 
        $1 as date, 
        'absent' as status, 
        NULL as entry_time, 
        NULL as exit_time, 
        NULL as work_mode, 
        false as is_late,
        true as is_auto_marked,
        NOW() as created_at,
        NOW() as updated_at
      FROM users u
      INNER JOIN mentor_student_assignments msa ON u.user_id = msa.student_id
      WHERE msa.mentor_id = $2 
        AND u.user_role = 'student'
        AND NOT EXISTS (
          SELECT 1 FROM attendance a 
          WHERE a.user_id = u.user_id AND a.date = $1
        )
      RETURNING *
    `, [date, mentorId]);

    res.status(200).json({ 
      success: true, 
      message: `${result.rowCount} students marked as absent`,
      autoMarkedCount: result.rowCount,
      markedStudents: result.rows
    });
  } catch (error) {
    console.error('Error auto-marking absent:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}