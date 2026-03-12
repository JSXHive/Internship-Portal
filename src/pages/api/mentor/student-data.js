// import { pool } from "../../../../lib/db";
import { pool } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { mentorId } = req.query;

  if (!mentorId) {
    return res.status(400).json({ message: "Mentor ID is required" });
  }

  try {
    console.log("Querying for mentor:", mentorId);
    
    const query = `
      SELECT 
        u.user_id,
        u.name,
        u.email,
        sp.phone,
        sp.profile_photo,
        u.student_id,
        sp.dob,
        sp.gender,
        sp.address,
        sp.linkedin_url,
        sp.github_url,
        sp.skills,
        sp.about,
        a.application_id,
        a.college,
        a.branch,
        a.year_of_study as year,
        a.cgpa,
        a.areas_of_interest,
        a.status as application_status,
        a.created_at as application_date,
        a.start_date,
        a.end_date,
        a.duration_months,
        a.resume_url as application_resume,
        sp.resume
      FROM applications a
      JOIN users u ON a.user_id = u.user_id
      LEFT JOIN student_profiles sp ON u.user_id = sp.user_id
      WHERE a.mentor = $1 AND a.status = 'accepted'
      ORDER BY u.name
    `;

    const result = await pool.query(query, [mentorId]);
    
    console.log("Query result:", result.rows.length, "students found");
    
    if (result.rows.length === 0) {
      return res.status(200).json({ 
        success: true,
        message: "No students found for this mentor",
        students: [] 
      });
    }

    res.status(200).json({ 
      success: true,
      students: result.rows 
    });
  } catch (error) {
    console.error("Error fetching allocated students:", error);
    res.status(500).json({ 
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}