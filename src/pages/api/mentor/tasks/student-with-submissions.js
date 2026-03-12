// import { pool } from '../../../../../lib/db';
import { pool } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { studentId, mentorId } = req.query;

  if (!studentId || !mentorId) {
    return res.status(400).json({
      success: false,
      message: 'Student ID and Mentor ID are required'
    });
  }

  try {
    const query = `
      SELECT 
        st.*,
        u.name as student_name,
        u.email as student_email,
        a.areas_of_interest,  -- ADDED: Get areas_of_interest from applications
        ts.submission_id,
        ts.submission_date,
        ts.remarks as submission_remarks,
        ts.file_paths,
        ts.status as submission_status,
        ts.mentor_feedback,
        ts.marks,
        ts.reviewed_by,
        reviewer.name as reviewer_name
      FROM student_tasks st
      INNER JOIN users u ON st.assigned_to = u.user_id
      INNER JOIN applications a ON u.user_id = a.user_id  -- ADDED: Join with applications
      LEFT JOIN task_submissions ts ON st.task_id = ts.task_id 
        AND ts.submission_id = (
          SELECT MAX(submission_id) 
          FROM task_submissions 
          WHERE task_id = st.task_id AND student_id = $1
        )
      LEFT JOIN users reviewer ON ts.reviewed_by = reviewer.user_id
      WHERE st.assigned_to = $1 AND st.assigned_by = $2
      ORDER BY 
        CASE 
          WHEN st.status = 'submitted' THEN 1
          WHEN st.status = 'in-progress' THEN 2
          WHEN st.status = 'pending' THEN 3
          ELSE 4
        END,
        st.due_date ASC,
        CASE st.priority
          WHEN 'high' THEN 1
          WHEN 'medium' THEN 2
          WHEN 'low' THEN 3
          ELSE 4
        END
    `;

    const result = await pool.query(query, [studentId, mentorId]);
    
    // Transform the data to include submission info in main task
    const tasks = result.rows.map(task => {
      const hasSubmission = task.submission_id !== null;
      
      return {
        ...task,
        // Ensure areas_of_interest is handled as string
        areas_of_interest: task.areas_of_interest, // This will be a string
        // If there's a submission, override the task status for display
        display_status: hasSubmission ? task.submission_status : task.status,
        has_submission: hasSubmission,
        submission_data: hasSubmission ? {
          submission_id: task.submission_id,
          submission_date: task.submission_date,
          remarks: task.submission_remarks,
          file_paths: task.file_paths,
          status: task.submission_status,
          mentor_feedback: task.mentor_feedback,
          marks: task.marks,
          reviewed_by: task.reviewed_by,
          reviewer_name: task.reviewer_name
        } : null
      };
    });

    res.status(200).json({
      success: true,
      tasks: tasks
    });

  } catch (error) {
    console.error('Error fetching student tasks with submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student tasks'
    });
  }
}