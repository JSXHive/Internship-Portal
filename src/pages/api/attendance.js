// import { pool } from "../../../lib/db";
import { pool } from "@/lib/db";

export default async function handler(req, res) {
  const { method, query, body } = req;

  try {
    // 🔹 1) Fetch Student Profile
    if (method === "GET" && query.user_id && !query.last && !query.today && !query.stats) {
      const { user_id } = query;
      const result = await pool.query(
        "SELECT user_id, name, email, student_id FROM users WHERE user_id = $1",
        [user_id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: "Student not found" });
      }
      return res.status(200).json({ success: true, student: result.rows[0] });
    }

    // 🔹 2) Get Today's Attendance Records
    if (method === "GET" && query.today && query.user_id) {
      const { user_id } = query;
      const today = new Date().toISOString().split('T')[0];
      
      const result = await pool.query(
        `SELECT *, 
                CASE 
                  WHEN entry_time IS NOT NULL AND exit_time IS NULL THEN 'entry'
                  WHEN entry_time IS NOT NULL AND exit_time IS NOT NULL THEN 'exit'
                  ELSE NULL 
                END as type,
                CASE 
                  WHEN entry_time IS NOT NULL THEN 'Present'
                  ELSE 'Absent'
                END as calculated_status
         FROM attendance 
         WHERE user_id = $1 AND date = $2`,
        [user_id, today]
      );
      
      return res.status(200).json({ 
        success: true, 
        records: result.rows 
      });
    }

    // 🔹 3) Get Last Attendance Record
    if (method === "GET" && query.last && query.user_id) {
      const { user_id } = query;
      const result = await pool.query(
        `SELECT *, 
                CASE 
                  WHEN entry_time IS NOT NULL AND exit_time IS NULL THEN 'entry'
                  WHEN entry_time IS NOT NULL AND exit_time IS NOT NULL THEN 'exit'
                  ELSE NULL 
                END as type,
                CASE 
                  WHEN exit_time IS NOT NULL THEN TO_CHAR(exit_time, 'HH12:MI AM')
                  WHEN entry_time IS NOT NULL THEN TO_CHAR(entry_time, 'HH12:MI AM')
                  ELSE 'N/A'
                END as formatted_time,
                CASE 
                  WHEN entry_time IS NOT NULL THEN 'Present'
                  ELSE 'Absent'
                END as calculated_status
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
      
      return res.status(200).json({ 
        success: true, 
        record: {
          date: record.date,
          type: record.type,
          work_mode: record.work_mode,
          formatted_time: record.formatted_time || "N/A",
          note: record.note || "",
          status: record.calculated_status || "Absent"
        }
      });
    }

    // 🔹 4) Get Attendance Stats with proper calculation
    if (method === "GET" && query.user_id && query.stats) {
      const { user_id } = query;
      
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
      
      // Count present days (days with entry marked)
      const presentDaysResult = await pool.query(
        `SELECT COUNT(DISTINCT date) as count
         FROM attendance 
         WHERE user_id = $1 
           AND date BETWEEN $2 AND $3
           AND entry_time IS NOT NULL`,
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
      
      return res.status(200).json({ 
        success: true, 
        stats: {
          present: presentDays,
          total: totalWorkingDays,
          absent: absentDays,
          percentage: percentage
        }
      });
    }

    // 🔹 5) Get Attendance Records by date
    if (method === "GET") {
      const { date } = query;
      let result;
      if (date) {
        result = await pool.query(
          `SELECT *, 
                  CASE 
                    WHEN entry_time IS NOT NULL THEN 'Present'
                    ELSE 'Absent'
                  END as calculated_status
           FROM attendance WHERE date = $1 ORDER BY entry_time ASC`,
          [date]
        );
      } else {
        result = await pool.query(
          `SELECT *, 
                  CASE 
                    WHEN entry_time IS NOT NULL THEN 'Present'
                    ELSE 'Absent'
                  END as calculated_status
           FROM attendance ORDER by date DESC, entry_time ASC`
        );
      }
      return res.status(200).json({ success: true, data: result.rows });
    }

    // 🔹 6) Mark Attendance (entry or exit separately) with note support - FIXED
    if (method === "POST") {
      const { user_id, student_id, name, email, date, work_mode, type, note, is_late, is_early, note_only } = body;

      // Handle note-only case (adding note to existing attendance)
      if (note_only) {
        // Check if attendance record exists for today
        const existingRecord = await pool.query(
          "SELECT * FROM attendance WHERE user_id = $1 AND date = $2",
          [user_id, date]
        );
        
        if (existingRecord.rows.length === 0) {
          // Create a new record with just a note if none exists
          const result = await pool.query(
            `INSERT INTO attendance (user_id, student_id, name, email, date, note, status, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, 'pending', NOW())
             RETURNING *`,
            [user_id, student_id, name, email, date, note]
          );
          
          return res.status(200).json({ success: true, data: result.rows[0] });
        } else {
          // Update existing record with note
          const existingNote = existingRecord.rows[0].note || "";
          const timestamp = new Date().toLocaleString();
          const combinedNote = existingNote 
            ? `${existingNote}\n[${timestamp}] ${note}`
            : `[${timestamp}] ${note}`;

          const result = await pool.query(
            `UPDATE attendance 
             SET note = $3
             WHERE user_id = $1 AND date = $2
             RETURNING *`,
            [user_id, date, combinedNote]
          );
          
          return res.status(200).json({ success: true, data: result.rows[0] });
        }
      }

      // Check if the date is within the student's internship period
      const internshipCheck = await pool.query(
        `SELECT start_date, end_date, mentor FROM applications 
         WHERE user_id = $1 AND status = 'accepted'`,
        [user_id]
      );

      if (internshipCheck.rows.length === 0) {
        return res.status(400).json({ 
          success: false, 
          error: "No accepted internship found for this student" 
        });
      }

      const { start_date, end_date, mentor } = internshipCheck.rows[0];
      
      // Check if mentor is allocated
      if (!mentor || mentor.trim() === '') {
        return res.status(400).json({ 
          success: false, 
          error: "Mentor not allocated. Please wait for mentor assignment." 
        });
      }
      
      // Convert dates to comparable format
      const internshipStart = new Date(start_date);
      const internshipEnd = new Date(end_date);
      const currentDate = new Date(date);
      
      // Set time to midnight for accurate comparison
      internshipStart.setHours(0, 0, 0, 0);
      internshipEnd.setHours(23, 59, 59, 999);
      currentDate.setHours(0, 0, 0, 0);
      
      if (currentDate < internshipStart) {
        return res.status(400).json({ 
          success: false, 
          error: `Cannot mark attendance before internship start date (${start_date})` 
        });
      }
      
      if (currentDate > internshipEnd) {
        return res.status(400).json({ 
          success: false, 
          error: `Cannot mark attendance after internship end date (${end_date})` 
        });
      }

      if (type === "entry") {
        // Check if entry already exists for today
        const existingEntry = await pool.query(
          "SELECT * FROM attendance WHERE user_id = $1 AND date = $2",
          [user_id, date]
        );

        if (existingEntry.rows.length > 0 && existingEntry.rows[0].entry_time) {
          return res.status(400).json({ 
            success: false, 
            error: "Entry already marked for today" 
          });
        }

        // Get current time in IST (Asia/Kolkata)
        const now = new Date();
        const istTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
        const entryTime = `${istTime.getHours().toString().padStart(2, '0')}:${istTime.getMinutes().toString().padStart(2, '0')}:${istTime.getSeconds().toString().padStart(2, '0')}`;

        // Mark entry with optional note and late status
        if (existingEntry.rows.length > 0) {
          // Update existing record
          const result = await pool.query(
            `UPDATE attendance 
             SET entry_time = $3::timetz, 
                 work_mode = $4,
                 note = COALESCE($5, note),
                 is_late = $6,
                 status = 'present'
             WHERE user_id = $1 AND date = $2
             RETURNING *`,
            [user_id, date, entryTime, work_mode, note || null, is_late || false]
          );
          
          return res.status(200).json({ 
            success: true, 
            message: "Entry marked successfully! You are now counted as present for today.",
            data: result.rows[0] 
          });
        } else {
          // Create new record
          const result = await pool.query(
            `INSERT INTO attendance (user_id, student_id, name, email, date, entry_time, work_mode, note, is_late, status, created_at)
             VALUES ($1, $2, $3, $4, $5, $6::timetz, $7, $8, $9, 'present', NOW())
             RETURNING *`,
            [user_id, student_id, name, email, date, entryTime, work_mode, note || null, is_late || false]
          );
          
          return res.status(200).json({ 
            success: true, 
            message: "Entry marked successfully! You are now counted as present for today.",
            data: result.rows[0] 
          });
        }
      }

      if (type === "exit") {
        // Check if entry exists before marking exit
        const existingEntry = await pool.query(
          "SELECT * FROM attendance WHERE user_id = $1 AND date = $2",
          [user_id, date]
        );

        if (existingEntry.rows.length === 0) {
          return res.status(400).json({ 
            success: false, 
            error: "Entry must be marked before exit" 
          });
        }

        // Check if exit already marked
        if (existingEntry.rows[0].exit_time) {
          return res.status(400).json({ 
            success: false, 
            error: "Exit already marked for today" 
          });
        }

        // Get current time in IST (Asia/Kolkata)
        const now = new Date();
        const istTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
        const exitTime = `${istTime.getHours().toString().padStart(2, '0')}:${istTime.getMinutes().toString().padStart(2, '0')}:${istTime.getSeconds().toString().padStart(2, '0')}`;

        // Get existing note if any
        const existingNote = existingEntry.rows[0].note || "";
        
        // Combine notes if both exist
        const combinedNote = note 
          ? (existingNote ? `${existingNote}\n${note}` : note)
          : existingNote;

        // Mark exit with optional note and early status
        const result = await pool.query(
          `UPDATE attendance 
           SET exit_time = $3::timetz, 
               note = $4, 
               is_early = $5
           WHERE user_id = $1 AND date = $2
           RETURNING *`,
          [user_id, date, exitTime, combinedNote || null, is_early || false]
        );

        return res.status(200).json({ 
          success: true, 
          message: "Exit marked successfully!",
          data: result.rows[0] 
        });
      }

      return res.status(400).json({ success: false, error: "Invalid attendance type" });
    }

    // 🔹 Method Not Allowed
    return res.status(405).json({ success: false, message: "Method not allowed" });
  } catch (err) {
    console.error("API Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}