import { pool } from '../../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { date, autoMarkAbsent } = req.query;

  try {
    // Get all students
    const studentsResult = await pool.query(`
      SELECT user_id, student_id, name, email 
      FROM users 
      WHERE user_role = 'student'
    `);

    const students = studentsResult.rows;

    // Get attendance for the selected date
    const attendanceResult = await pool.query(`
      SELECT 
        a.*,
        u.student_id,
        sp.college
      FROM attendance a
      JOIN users u ON a.user_id = u.user_id
      LEFT JOIN student_profiles sp ON u.user_id = sp.user_id
      WHERE a.date = $1
      ORDER BY u.name
    `, [date]);

    let attendance = attendanceResult.rows;

    // Auto-mark absent students if requested
    let autoMarkedAbsent = 0;
    if (autoMarkAbsent === 'true') {
      const studentsWithAttendance = new Set(attendance.map(a => a.user_id));
      
      for (const student of students) {
        if (!studentsWithAttendance.has(student.user_id)) {
          try {
            // Insert absent record
            await pool.query(`
              INSERT INTO attendance (user_id, name, email, date, status, is_auto_marked)
              VALUES ($1, $2, $3, $4, 'absent', true)
              ON CONFLICT (user_id, date) DO NOTHING
            `, [student.user_id, student.name, student.email, date]);
            
            autoMarkedAbsent++;
          } catch (insertError) {
            console.error('Error auto-marking absent for student:', student.user_id, insertError);
            // Continue with other students even if one fails
          }
        }
      }

      // Refresh attendance data after auto-marking
      if (autoMarkedAbsent > 0) {
        const updatedAttendance = await pool.query(`
          SELECT 
            a.*,
            u.student_id,
            sp.college
          FROM attendance a
          JOIN users u ON a.user_id = u.user_id
          LEFT JOIN student_profiles sp ON u.user_id = sp.user_id
          WHERE a.date = $1
          ORDER BY u.name
        `, [date]);
        attendance = updatedAttendance.rows;
      }
    }

    res.status(200).json({
      attendance,
      autoMarkedAbsent,
      totalStudents: students.length
    });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}