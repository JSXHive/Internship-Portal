// import { pool } from "../../../../../lib/db";
import { pool } from "@/lib/db"; 

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { studentId, mentorId } = req.query;

  console.log("Fetching tasks for student:", studentId, "mentor:", mentorId);

  if (!studentId || !mentorId) {
    return res.status(400).json({ 
      message: "Student ID and Mentor ID are required",
      received: { studentId, mentorId }
    });
  }

  try {
    // Verify the mentor has access to this student (or create relationship if needed)
    const verification = await pool.query(
      `SELECT 1 FROM mentor_student_assignments 
       WHERE mentor_id = $1 AND student_id = $2`,
      [mentorId, studentId]
    );

    if (verification.rows.length === 0) {
      // Auto-create relationship if it doesn't exist
      await pool.query(
        `INSERT INTO mentor_student_assignments (mentor_id, student_id, status)
         VALUES ($1, $2, 'active')`,
        [mentorId, studentId]
      );
      console.log("Auto-created relationship for data access");
    }

    const result = await pool.query(
      `SELECT 
        task_id, 
        title, 
        description, 
        due_date, 
        priority, 
        category, 
        status, 
        estimated_hours, 
        resources,
        created_at, 
        updated_at,
        assigned_to,
        assigned_by
       FROM student_tasks 
       WHERE assigned_to = $1 
       ORDER BY 
         CASE priority 
           WHEN 'high' THEN 1 
           WHEN 'medium' THEN 2 
           WHEN 'low' THEN 3 
         END,
         due_date ASC NULLS LAST`,
      [studentId]
    );

    console.log(`Found ${result.rows.length} tasks for student ${studentId}`);

    res.status(200).json({
      success: true,
      tasks: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error("Database error fetching student tasks:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
}