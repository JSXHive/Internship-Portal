// import { pool } from '../../../../lib/db';
import { pool } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { mentorId } = req.query;

  if (!mentorId) {
    return res.status(400).json({ message: 'Mentor ID is required' });
  }

  try {
    console.log('Fetching attendance stats for mentor:', mentorId);

    // Get today's date
    const today = new Date().toISOString().split('T')[0];

    // Get students assigned to this mentor
    const studentsQuery = `
      SELECT user_id 
      FROM applications 
      WHERE mentor = $1 AND status = 'accepted'
    `;
    
    const studentsResult = await pool.query(studentsQuery, [mentorId]);
    const studentIds = studentsResult.rows.map(row => row.user_id);

    if (studentIds.length === 0) {
      return res.status(200).json({
        presentToday: 0,
        absentToday: 0,
        lateToday: 0,
        workFromHome: 0,
        averageAttendance: 0
      });
    }

    // Get today's attendance stats
    const todayStatsQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'present' THEN 1 END) as present,
        COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent,
        COUNT(CASE WHEN is_late = true THEN 1 END) as late,
        COUNT(CASE WHEN work_mode = 'home' THEN 1 END) as work_from_home
      FROM attendance 
      WHERE user_id = ANY($1) AND date = $2
    `;

    const todayStatsResult = await pool.query(todayStatsQuery, [studentIds, today]);
    const todayStats = todayStatsResult.rows[0];

    // Get average attendance for the last 30 days
    const avgAttendanceQuery = `
      SELECT 
        COUNT(DISTINCT date) as total_days,
        COUNT(CASE WHEN status = 'present' THEN 1 END) as present_days
      FROM attendance 
      WHERE user_id = ANY($1) AND date >= CURRENT_DATE - INTERVAL '30 days'
    `;

    const avgResult = await pool.query(avgAttendanceQuery, [studentIds]);
    const avgStats = avgResult.rows[0];
    
    const averageAttendance = avgStats.total_days > 0 
      ? Math.round((avgStats.present_days / (studentIds.length * avgStats.total_days)) * 100)
      : 0;

    const stats = {
      presentToday: parseInt(todayStats.present) || 0,
      absentToday: parseInt(todayStats.absent) || 0,
      lateToday: parseInt(todayStats.late) || 0,
      workFromHome: parseInt(todayStats.work_from_home) || 0,
      averageAttendance: averageAttendance
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching attendance stats:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
}