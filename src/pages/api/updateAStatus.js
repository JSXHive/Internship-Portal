// pages/api/updateStatus.js
import { pool } from "../../../lib/db"; // adjust path if needed

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { application_id, status, mentor } = req.body;

    if (!application_id || !status) {
      return res.status(400).json({ error: "application_id and status are required" });
    }

    // ✅ Update application status (and mentor if provided)
    const result = await pool.query(
      `UPDATE applications
       SET status = $1,
           mentor = COALESCE($2, mentor),
           updated_at = NOW()
       WHERE application_id = $3
       RETURNING *`,
      [status, mentor || null, application_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Application not found" });
    }

    res.status(200).json({
      message: "Status updated successfully",
      application: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Error updating application:", err);
    res.status(500).json({ error: err.message || "Failed to update status" });
  }
}
