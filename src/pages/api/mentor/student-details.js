import { pool } from "../../../../lib/db";

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
        u.student_id,
        a.application_id,
        a.college,
        a.branch,
        a.year_of_study,
        a.areas_of_interest,
        sp.profile_photo,
        COALESCE((
          SELECT COUNT(*) 
          FROM student_tasks st 
          WHERE st.assigned_to = u.user_id 
          AND st.status = 'completed'
        ), 0) as completed_tasks,
        COALESCE((
          SELECT COUNT(*) 
          FROM student_tasks st 
          WHERE st.assigned_to = u.user_id 
          AND st.status IN ('pending', 'in-progress')
        ), 0) as pending_tasks
      FROM applications a
      JOIN users u ON a.user_id = u.user_id
      LEFT JOIN student_profiles sp ON u.user_id = sp.user_id
      WHERE a.mentor = $1 AND a.status = 'accepted'
      ORDER BY u.name
    `;

    const result = await pool.query(query, [mentorId]);
    
    console.log("Query result:", result.rows);
    
    if (result.rows.length === 0) {
      return res.status(200).json({ 
        success: true,
        message: "No students found for this mentor",
        students: [] 
      });
    }

    // Ensure areas_of_interest is returned as string
    const students = result.rows.map(row => ({
      ...row,
      areas_of_interest: row.areas_of_interest // This will be a string from DB
    }));

    res.status(200).json({ 
      success: true,
      students: students 
    });
  } catch (error) {
    console.error("Error fetching allocated students:", error);
    res.status(500).json({ 
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}