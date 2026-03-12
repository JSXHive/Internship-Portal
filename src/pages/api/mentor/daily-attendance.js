// import { pool } from '../../../../lib/db';
import { pool } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { mentorId, date, autoMarkAbsent = 'true' } = req.query;

    if (!mentorId || !date) {
      return res.status(400).json({ message: 'Mentor ID and date are required' });
    }

    // Check if we should auto-mark absent (only after 6 PM)
    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    const shouldAutoMark = autoMarkAbsent === 'true' && currentHour >= 18; // After 6 PM only

    // Get all students assigned to this mentor with internship dates
    const studentsResult = await pool.query(`
      SELECT 
        u.user_id,
        u.student_id,
        u.name,
        sp.college,
        a.start_date,
        a.end_date,
        a.duration_months
      FROM users u
      LEFT JOIN student_profiles sp ON u.user_id = sp.user_id
      LEFT JOIN applications a ON u.user_id = a.user_id
      INNER JOIN mentor_student_assignments msa ON u.user_id = msa.student_id
      WHERE msa.mentor_id = $1 AND u.user_role = 'student'
    `, [mentorId]);

    const allStudents = studentsResult.rows;
    
    // Get attendance records for the specified date
    const attendanceResult = await pool.query(`
      SELECT 
        a.*,
        u.student_id,
        u.name,
        sp.college
      FROM attendance a
      INNER JOIN users u ON a.user_id = u.user_id
      LEFT JOIN student_profiles sp ON u.user_id = sp.user_id
      INNER JOIN mentor_student_assignments msa ON u.user_id = msa.student_id
      WHERE msa.mentor_id = $1 AND a.date = $2
    `, [mentorId, date]);

    const existingAttendance = attendanceResult.rows;
    
    let autoMarkedAbsentCount = 0;
    const finalAttendance = [];

    // Add existing attendance records
    existingAttendance.forEach(record => {
      finalAttendance.push({
        ...record,
        is_auto_marked: false
      });
    });

    // Auto-mark absent for students without attendance records ONLY AFTER 6 PM
    if (shouldAutoMark) {
      const studentsWithAttendance = new Set(existingAttendance.map(record => record.user_id));
      
      for (const student of allStudents) {
        if (!studentsWithAttendance.has(student.user_id)) {
          // Check if this student already has an auto-marked record for today
          const existingAutoMarked = finalAttendance.find(
            record => record.user_id === student.user_id && record.is_auto_marked
          );
          
          if (!existingAutoMarked) {
            // Create absent record for student without attendance
            finalAttendance.push({
              user_id: student.user_id,
              student_id: student.student_id,
              name: student.name,
              college: student.college,
              date: date,
              status: 'absent',
              entry_time: null,
              exit_time: null,
              work_mode: null,
              is_late: false,
              is_auto_marked: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
            autoMarkedAbsentCount++;
          }
        }
      }
    }

    // Sort by student name
    finalAttendance.sort((a, b) => a.name.localeCompare(b.name));

    res.status(200).json({ 
      success: true, 
      attendance: finalAttendance,
      autoMarkedAbsent: autoMarkedAbsentCount,
      totalStudents: allStudents.length,
      presentCount: finalAttendance.filter(a => a.status === 'present').length,
      absentCount: finalAttendance.filter(a => a.status === 'absent').length,
      autoMarkEnabled: shouldAutoMark,
      currentTime: currentTime.toISOString(),
      stats: {
        total: allStudents.length,
        present: finalAttendance.filter(a => a.status === 'present').length,
        absent: finalAttendance.filter(a => a.status === 'absent').length,
        late: finalAttendance.filter(a => a.is_late).length,
        office: finalAttendance.filter(a => a.work_mode === 'office').length,
        wfh: finalAttendance.filter(a => a.work_mode === 'home').length,
        halfday: finalAttendance.filter(a => a.status === 'halfday').length,
      }
    });
  } catch (error) {
    console.error('Error fetching daily attendance:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}