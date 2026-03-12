import { pool } from "../../../../lib/db";

export default async function handler(req, res) {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ success: false, error: "User ID is required" });
  }

  try {
    const result = await pool.query(
      `SELECT *, 
              CASE 
                WHEN entry_time IS NOT NULL AND exit_time IS NULL THEN 'entry'
                WHEN entry_time IS NOT NULL AND exit_time IS NOT NULL THEN 'exit'
                ELSE NULL 
              END as type,
              CASE 
                WHEN entry_time IS NOT NULL THEN 'Present'  -- ✅ MAJOR CHANGE: Entry alone counts as present
                ELSE 'Absent'
              END as status
       FROM attendance 
       WHERE user_id = $1 
       ORDER BY date DESC, 
                CASE 
                  WHEN exit_time IS NOT NULL THEN exit_time
                  ELSE entry_time
                END DESC 
       LIMIT 1`,
      [user_id]
    );

    if (result.rows.length === 0) {
      return res.status(200).json({ success: true, record: null });
    }

    const record = result.rows[0];
    
    // Format time from time with time zone string
    const formatTimeFromTZ = (timeStr) => {
      if (!timeStr) return 'N/A';
      
      // Extract just the time portion (HH:MM:SS)
      const timeOnly = timeStr.split(' ')[0];
      const [hours, minutes] = timeOnly.split(':');
      
      const hour = parseInt(hours);
      const minute = parseInt(minutes);
      
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      
      return `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
    };

    const formatted_time = record.exit_time 
      ? formatTimeFromTZ(record.exit_time) 
      : record.entry_time 
        ? formatTimeFromTZ(record.entry_time) 
        : 'N/A';
    
    res.status(200).json({
      success: true,
      record: {
        date: record.date,
        type: record.type,
        work_mode: record.work_mode,
        formatted_time: formatted_time,
        note: record.note || "",
        status: record.status || "Absent"  // ✅ Add status field
      }
    });
  } catch (err) {
    console.error("Error fetching last attendance:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}