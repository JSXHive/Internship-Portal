import { pool } from "../../../../../lib/db"; 

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { 
    submission_id, 
    feedback, 
    status, 
    rating 
  } = req.body;

  console.log("Submitting feedback for submission:", submission_id);

  if (!submission_id) {
    return res.status(400).json({ 
      success: false,
      message: "Submission ID is required" 
    });
  }

  try {
    const result = await pool.query(
      `UPDATE task_submissions 
       SET mentor_feedback = $1, 
           status = $2, 
           rating = $3,
           feedback_date = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE submission_id = $4
       RETURNING *`,
      [feedback, status, rating, submission_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Submission not found" 
      });
    }

    console.log("Feedback submitted successfully for submission:", submission_id);

    res.status(200).json({
      success: true,
      submission: result.rows[0],
      message: "Feedback submitted successfully"
    });
  } catch (error) {
    console.error("Database error submitting feedback:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
}