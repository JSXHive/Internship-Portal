// pages/api/getApplications.js
// import { pool } from "../../../lib/db";
import { pool } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { user_id } = req.query;

  try {
    let query = `
      SELECT
        application_id,
        user_id,
        full_name,
        email,
        contact,
        college,
        branch,
        year_of_study,
        cgpa,
        areas_of_interest,
        duration_months,
        start_date,
        end_date,
        resume_url,
        status,
        mentor,
        created_at,
        updated_at  -- 👈 ADD THIS LINE to include updated_at field
      FROM applications
    `;

    const params = [];

    if (user_id) {
      query += " WHERE user_id = $1 ORDER BY created_at DESC";
      params.push(user_id);
    } else {
      query += " ORDER BY created_at DESC";
    }

    const result = await pool.query(query, params);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching applications:", err);
    res.status(500).json({ error: err.message || "Failed to fetch applications" });
  }
}