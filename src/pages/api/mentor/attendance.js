import { pool } from '../../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { mentorId, date } = req.query;

  if (!mentorId) {
    return res.status(400).json({ message: 'Mentor ID is required' });
  }

  try {
    console.log('Fetching attendance for mentor:', mentorId, 'on date:', date);

    // Get students assigned to this mentor
    const studentsQuery = `
      SELECT user_id 
      FROM applications 
      WHERE mentor = $1 AND status = 'accepted'
    `;
    
    const studentsResult = await pool.query(studentsQuery, [mentorId]);
    const studentIds = studentsResult.rows.map(row => row.user_id);

    if (studentIds.length === 0) {
      return res.status(200).json({ attendance: [] });
    }

    // Get attendance data for these students
    let attendanceQuery = `
      SELECT 
        a.id,
        a.user_id,
        a.name,
        a.email,
        a.date,
        a.entry_time,
        a.exit_time,
        a.work_mode,
        a.status,
        a.is_late,
        a.is_early,
        a.note,
        a.created_at,
        u.student_id
      FROM attendance a
      LEFT JOIN users u ON a.user_id = u.user_id
      WHERE a.user_id = ANY($1)
    `;

    const queryParams = [studentIds];

    if (date) {
      attendanceQuery += ' AND a.date = $2';
      queryParams.push(date);
    }

    attendanceQuery += ' ORDER BY a.date DESC, a.created_at DESC';

    console.log('Executing attendance query');
    const attendanceResult = await pool.query(attendanceQuery, queryParams);
    
    const attendance = attendanceResult.rows.map(row => ({
      id: row.id,
      user_id: row.user_id,
      student_id: row.student_id,
      name: row.name,
      email: row.email,
      date: row.date,
      entry_time: row.entry_time,
      exit_time: row.exit_time,
      work_mode: row.work_mode,
      status: row.status,
      is_late: row.is_late,
      is_early: row.is_early,
      note: row.note,
      created_at: row.created_at
    }));

    res.status(200).json({ attendance });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
}