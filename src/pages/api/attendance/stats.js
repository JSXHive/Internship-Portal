import { pool } from "../../../../lib/db";

export default async function handler(req, res) {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ success: false, error: "User ID is required" });
  }

  try {
    // Get internship period
    const internshipRes = await pool.query(
      `SELECT start_date, end_date FROM applications 
       WHERE user_id = $1 AND status = 'accepted'`,
      [user_id]
    );
    
    if (internshipRes.rows.length === 0) {
      return res.status(200).json({ 
        success: true, 
        stats: { present: 0, total: 0, absent: 0, percentage: 0 } 
      });
    }
    
    const { start_date, end_date } = internshipRes.rows[0];
    
    // Get today's date for comparison
    const today = new Date().toISOString().split('T')[0];
    
    // Calculate working days between start date and today (or end date if earlier)
    const endDate = end_date && end_date < today ? end_date : today;
    
    // Use PostgreSQL generate_series for accurate working day count
    const workingDaysResult = await pool.query(
      `SELECT COUNT(*) as count
       FROM generate_series(
         $1::date, 
         $2::date, 
         '1 day'::interval
       ) as day
       WHERE EXTRACT(DOW FROM day) NOT IN (0, 6)`,
      [start_date, endDate]
    );
    
    const workingDaysToDate = parseInt(workingDaysResult.rows[0].count);
    
    // ✅ MAJOR CHANGE: Count present days (days with entry marked - exit is optional)
    const presentDaysResult = await pool.query(
      `SELECT COUNT(DISTINCT date) as count
       FROM attendance 
       WHERE user_id = $1 
         AND date BETWEEN $2 AND $3
         AND entry_time IS NOT NULL`, // Only require entry_time, exit_time is optional
      [user_id, start_date, endDate]
    );
    
    const presentDays = parseInt(presentDaysResult.rows[0].count);
    
    // Calculate total working days in internship period
    const totalWorkingDaysResult = await pool.query(
      `SELECT COUNT(*) as count
       FROM generate_series(
         $1::date, 
         $2::date, 
         '1 day'::interval
       ) as day
       WHERE EXTRACT(DOW FROM day) NOT IN (0, 6)`,
      [start_date, end_date]
    );
    
    const totalWorkingDays = parseInt(totalWorkingDaysResult.rows[0].count);
    
    // Calculate absent days
    const absentDays = Math.max(0, workingDaysToDate - presentDays);
    const percentage = workingDaysToDate > 0 
      ? Math.round((presentDays / workingDaysToDate) * 100) 
      : 0;
    
    res.status(200).json({
      success: true,
      stats: {
        present: presentDays,
        total: totalWorkingDays,
        absent: absentDays,
        percentage: percentage
      }
    });
  } catch (err) {
    console.error("Error fetching attendance stats:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}