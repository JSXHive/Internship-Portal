// import { pool } from "../../../../lib/db";
import { pool } from "@/lib/db";

export default async function handler(req, res) {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ success: false, error: "User ID is required" });
  }

  try {
    // First, get the internship period to know the date range
    const internshipRes = await pool.query(
      `SELECT start_date, end_date FROM applications 
       WHERE user_id = $1 AND status = 'accepted'`,
      [user_id]
    );
    
    if (internshipRes.rows.length === 0) {
      return res.status(200).json({ 
        success: true, 
        data: [] 
      });
    }
    
    const { start_date, end_date } = internshipRes.rows[0];
    const today = new Date().toISOString().split('T')[0];
    const endDate = end_date && end_date < today ? end_date : today;

    // Get all working days in the internship period
    const workingDaysResult = await pool.query(
      `SELECT day::date as date
       FROM generate_series(
         $1::date, 
         $2::date, 
         '1 day'::interval
       ) as day
       WHERE EXTRACT(DOW FROM day) NOT IN (0, 6)
       ORDER BY day::date DESC`,
      [start_date, endDate]
    );

    // Get existing attendance records
    const attendanceResult = await pool.query(
      `SELECT *,
              CASE 
                WHEN entry_time IS NOT NULL AND exit_time IS NULL THEN 'entry'
                WHEN entry_time IS NOT NULL AND exit_time IS NOT NULL THEN 'exit'
                ELSE NULL 
              END as type
       FROM attendance 
       WHERE user_id = $1 AND date BETWEEN $2 AND $3
       ORDER BY date DESC`,
      [user_id, start_date, endDate]
    );

    // Create a map of existing attendance records by date
    const attendanceMap = new Map();
    attendanceResult.rows.forEach(record => {
      attendanceMap.set(record.date.toISOString().split('T')[0], record);
    });

    // Enhanced time formatting function for PostgreSQL time with time zone
    const formatTime = (timeString) => {
      if (!timeString) return null;
      
      try {
        // Handle PostgreSQL time with time zone format (e.g., "12:56:31.815673+00")
        // Extract just the time part before the timezone
        const timePart = timeString.split('+')[0].split('-')[0];
        const [hoursStr, minutesStr, secondsStr] = timePart.split(':');
        
        let hours = parseInt(hoursStr);
        const minutes = parseInt(minutesStr);
        
        // Handle invalid values
        if (isNaN(hours) || isNaN(minutes)) {
          return null;
        }

        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours === 0 ? 12 : hours; // Convert 0 to 12
        
        return `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
      } catch (error) {
        console.error('Error formatting time:', error, 'Time string:', timeString);
        return null;
      }
    };

    // Combine working days with attendance data
    // This creates records for ALL working days, including absent days
    const formattedData = workingDaysResult.rows.map(day => {
      const dateStr = day.date.toISOString().split('T')[0];
      const attendanceRecord = attendanceMap.get(dateStr);

      if (attendanceRecord) {
        // Has attendance record
        const formattedEntryTime = formatTime(attendanceRecord.entry_time);
        const formattedExitTime = formatTime(attendanceRecord.exit_time);

        return {
          id: attendanceRecord.id,
          user_id: attendanceRecord.user_id,
          student_id: attendanceRecord.student_id,
          name: attendanceRecord.name,
          email: attendanceRecord.email,
          date: dateStr,
          entry_time: attendanceRecord.entry_time,
          exit_time: attendanceRecord.exit_time,
          work_mode: attendanceRecord.work_mode || 'office',
          status: 'present', // For counting
          display_status: attendanceRecord.is_late ? 'late' : 'present',
          note: attendanceRecord.note,
          is_late: attendanceRecord.is_late || false,
          is_early: attendanceRecord.is_early || false,
          created_at: attendanceRecord.created_at,
          updated_at: attendanceRecord.updated_at,
          formatted_entry_time: formattedEntryTime || '-',
          formatted_exit_time: formattedExitTime || '-',
          type: attendanceRecord.type,
          has_attendance: true
        };
      } else {
        // No attendance record - this is an absent day
        return {
          id: null,
          user_id: user_id,
          student_id: null,
          name: null,
          email: null,
          date: dateStr,
          entry_time: null,
          exit_time: null,
          work_mode: null,
          status: 'absent',
          display_status: 'absent',
          note: null,
          is_late: false,
          is_early: false,
          created_at: null,
          updated_at: null,
          formatted_entry_time: '-',
          formatted_exit_time: '-',
          type: null,
          has_attendance: false
        };
      }
    });

    res.status(200).json({
      success: true,
      data: formattedData
    });
  } catch (err) {
    console.error("Error fetching attendance history:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}