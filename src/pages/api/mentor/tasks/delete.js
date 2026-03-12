// import { pool } from "../../../../../lib/db"; 
import { pool } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { taskId } = req.query;

  console.log("Deleting task:", taskId);

  if (!taskId) {
    return res.status(400).json({ 
      success: false,
      message: "Task ID is required" 
    });
  }

  try {
    // First, delete any submissions for this task to maintain referential integrity
    await pool.query(
      `DELETE FROM task_submissions WHERE task_id = $1`,
      [taskId]
    );

    // Then delete the task
    const result = await pool.query(
      `DELETE FROM student_tasks WHERE task_id = $1 RETURNING *`,
      [taskId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Task not found" 
      });
    }

    console.log("Task deleted successfully:", taskId);

    res.status(200).json({
      success: true,
      message: "Task deleted successfully"
    });
  } catch (error) {
    console.error("Database error deleting task:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
}