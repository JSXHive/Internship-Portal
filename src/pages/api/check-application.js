// import { pool } from "../../../lib/db";
import { pool } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    // First get user_id from users table
    const userResult = await pool.query(
      "SELECT user_id FROM public.users WHERE email = $1",
      [email.toLowerCase()]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = userResult.rows[0].user_id;

    // Check if application exists for this user
    const applicationResult = await pool.query(
      `SELECT application_id, status, resume_url, 
              areas_of_interest as interest, duration_months as duration,
              start_date, end_date
       FROM public.applications 
       WHERE user_id = $1`,
      [userId]
    );

    if (applicationResult.rows.length > 0) {
      const application = applicationResult.rows[0];
      return res.status(200).json({ 
        exists: true, 
        status: application.status,
        application: {
          interest: application.interest || '', // Single string now, not array
          duration: application.duration,
          start_date: application.start_date,
          end_date: application.end_date,
          resumeUrl: application.resume_url,
          resumeName: application.resume_url ? 
            application.resume_url.split('/').pop().replace(/_/g, ' ') : ''
        }
      });
    } else {
      return res.status(200).json({ exists: false });
    }
  } catch (error) {
    console.error("Error checking application:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}