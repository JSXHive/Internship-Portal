// import { pool } from "../../../../lib/db";
import { pool } from "@/lib/db";

export default async function handler(req, res) {
  const { method, body, query } = req;

  // Allow both POST and PUT methods for flexibility
  if (method !== "POST" && method !== "PUT") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    // Support both body parameters and query parameters
    const { user_id, date, note, note_only } = method === "POST" ? body : query;

    if (!user_id || !date) {
      return res.status(400).json({ 
        success: false, 
        error: "Missing required fields: user_id and date are required" 
      });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({ 
        success: false, 
        error: "Invalid date format. Please use YYYY-MM-DD format" 
      });
    }

    // Check if attendance record exists for the day
    const existingRecord = await pool.query(
      "SELECT * FROM attendance WHERE user_id = $1 AND date = $2",
      [user_id, date]
    );

    if (existingRecord.rows.length === 0) {
      // ✅ MAJOR CHANGE: Create a new record with just a note if none exists
      const result = await pool.query(
        `INSERT INTO attendance (user_id, date, note, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW())
         RETURNING *`,
        [user_id, date, note]
      );

      return res.status(200).json({ 
        success: true, 
        message: "Note added successfully (new record created)",
        data: result.rows[0] 
      });
    }

    // Get existing note if any
    const existingNote = existingRecord.rows[0].note || "";
    
    // For note-only requests, just update the note
    if (note_only) {
      // Combine notes if both exist (with timestamp for better tracking)
      const timestamp = new Date().toLocaleString();
      const combinedNote = existingNote 
        ? `${existingNote}\n[${timestamp}] ${note}`
        : `[${timestamp}] ${note}`;

      // Update the note
      const result = await pool.query(
        `UPDATE attendance 
         SET note = $3, updated_at = NOW()
         WHERE user_id = $1 AND date = $2
         RETURNING *`,
        [user_id, date, combinedNote]
      );

      return res.status(200).json({ 
        success: true, 
        message: "Note added successfully",
        data: result.rows[0] 
      });
    }
    
    // For regular attendance marking with note
    // This would be handled by your main attendance endpoint
    return res.status(400).json({ 
      success: false, 
      error: "Use the main attendance endpoint for marking attendance with notes" 
    });
    
  } catch (err) {
    console.error("API Error:", err);
    return res.status(500).json({ 
      success: false, 
      error: "Internal server error",
      message: err.message 
    });
  }
}