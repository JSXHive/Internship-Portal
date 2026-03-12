// src/pages/api/mentor/[mentorId].js
import { pool } from "../../../../lib/db";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { mentorId } = req.query;

  console.log("Fetching mentor with ID:", mentorId);

  if (!mentorId) {
    return res.status(400).json({ 
      success: false,
      message: "Mentor ID is required" 
    });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM mentor_profiles WHERE user_id = $1`,
      [mentorId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Mentor not found" 
      });
    }

    console.log("Mentor fetched successfully:", mentorId);

    res.status(200).json({
      success: true,
      data: result.rows[0],
      message: "Mentor fetched successfully"
    });
  } catch (error) {
    console.error("Database error fetching mentor:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
}