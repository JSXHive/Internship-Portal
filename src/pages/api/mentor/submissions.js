import { pool } from "../../../../lib/db";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ 
      success: false,
      message: "Method not allowed" 
    });
  }

  const { studentId, mentorId } = req.query;

  console.log("Fetching submissions for student:", studentId, "mentor:", mentorId);

  if (!studentId || !mentorId) {
    return res.status(400).json({ 
      success: false,
      message: "Student ID and Mentor ID are required",
      received: { studentId, mentorId }
    });
  }

  // Check if pool is available
  if (!pool) {
    console.error("Database pool is not available");
    return res.status(500).json({ 
      success: false,
      message: "Database connection not available"
    });
  }

  try {
    // Verify the mentor has access to this student
    console.log("Verifying mentor-student relationship...");
    const verification = await pool.query(
      `SELECT * FROM mentor_student_assignments 
       WHERE mentor_id = $1 AND student_id = $2`,
      [mentorId, studentId]
    );

    console.log("Verification result:", verification.rows);

    if (verification.rows.length === 0) {
      // Let's check if the student exists and what mentor assignments they have
      const studentCheck = await pool.query(
        `SELECT user_id, name FROM users WHERE user_id = $1`,
        [studentId]
      );
      
      const mentorCheck = await pool.query(
        `SELECT user_id, name FROM users WHERE user_id = $1`,
        [mentorId]
      );

      const allAssignments = await pool.query(
        `SELECT * FROM mentor_student_assignments WHERE student_id = $1`,
        [studentId]
      );

      console.log("Debug info:", {
        studentExists: studentCheck.rows.length > 0,
        mentorExists: mentorCheck.rows.length > 0,
        studentName: studentCheck.rows[0]?.name,
        mentorName: mentorCheck.rows[0]?.name,
        allAssignmentsForStudent: allAssignments.rows
      });

      return res.status(403).json({ 
        success: false,
        message: "Access denied to this student",
        details: `Mentor ${mentorId} cannot access student ${studentId}`,
        debug: {
          studentExists: studentCheck.rows.length > 0,
          mentorExists: mentorCheck.rows.length > 0,
          assignmentsCount: allAssignments.rows.length
        }
      });
    }

    // Get submissions with task details
    const result = await pool.query(
      `SELECT 
        ts.submission_id, 
        ts.task_id, 
        ts.submission_date, 
        ts.remarks, 
        ts.file_paths, 
        ts.status,
        ts.mentor_feedback, 
        ts.rating, 
        ts.feedback_date,
        t.title as task_title, 
        t.due_date as task_due_date,
        t.assigned_to as student_id
       FROM task_submissions ts
       INNER JOIN student_tasks t ON ts.task_id = t.task_id
       WHERE t.assigned_to = $1 
       ORDER BY ts.submission_date DESC`,
      [studentId]
    );

    console.log(`Found ${result.rows.length} submissions for student ${studentId}`);

    // Parse file_paths if they're stored as string
    const submissions = result.rows.map(submission => ({
      ...submission,
      file_paths: submission.file_paths ? 
        (typeof submission.file_paths === 'string' ? 
          submission.file_paths.split(',').map(path => path.trim()) : 
          submission.file_paths) : 
        []
    }));

    res.status(200).json({
      success: true,
      submissions: submissions,
      count: submissions.length
    });
  } catch (error) {
    console.error("Database error fetching submissions:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}