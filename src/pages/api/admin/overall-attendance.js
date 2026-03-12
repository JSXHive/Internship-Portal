// import { pool } from '../../../../lib/db';
import { pool } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const attendanceQuery = `
      SELECT 
        u.user_id,
        u.student_id,
        sp.name,
        sp.email,
        sp.profile_photo,
        sp.college,
        sp.branch,
        sp.year_of_study,
        COUNT(DISTINCT a.date) as total_days,
        COUNT(DISTINCT CASE WHEN a.status = 'present' THEN a.date END) as present_days,
        COUNT(DISTINCT CASE WHEN a.status = 'absent' THEN a.date END) as absent_days,
        COUNT(DISTINCT CASE WHEN a.is_late = true THEN a.date END) as late_days,
        COUNT(DISTINCT CASE WHEN a.work_mode = 'office' THEN a.date END) as office_days,
        COUNT(DISTINCT CASE WHEN a.work_mode = 'home' THEN a.date END) as wfh_days,
        CASE 
          WHEN COUNT(DISTINCT a.date) > 0 THEN 
            ROUND((COUNT(DISTINCT CASE WHEN a.status = 'present' THEN a.date END) * 100.0 / COUNT(DISTINCT a.date)), 2)
          ELSE 0 
        END as attendance_percentage,
        MIN(a.date) as first_attendance,
        MAX(a.date) as last_attendance
      FROM users u
      LEFT JOIN student_profiles sp ON u.user_id = sp.user_id
      LEFT JOIN attendance a ON u.user_id = a.user_id
      WHERE u.user_role = 'student'
      GROUP BY u.user_id, u.student_id, sp.name, sp.email, sp.profile_photo, sp.college, sp.branch, sp.year_of_study
      ORDER BY attendance_percentage DESC, sp.name ASC
    `;

    const client = await pool.connect();
    try {
      const result = await client.query(attendanceQuery);
      
      const attendanceData = result.rows.map(row => ({
        user_id: row.user_id,
        student_id: row.student_id,
        name: row.name,
        email: row.email,
        profile_photo: row.profile_photo,
        college: row.college || 'Not specified',
        branch: row.branch || 'Not specified',
        year_of_study: row.year_of_study || 'Not specified',
        total_days: parseInt(row.total_days) || 0,
        present_days: parseInt(row.present_days) || 0,
        absent_days: parseInt(row.absent_days) || 0,
        late_days: parseInt(row.late_days) || 0,
        office_days: parseInt(row.office_days) || 0,
        wfh_days: parseInt(row.wfh_days) || 0,
        attendance_percentage: parseFloat(row.attendance_percentage) || 0,
        first_attendance: row.first_attendance,
        last_attendance: row.last_attendance
      }));

      res.status(200).json({ attendance: attendanceData });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching overall attendance:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}