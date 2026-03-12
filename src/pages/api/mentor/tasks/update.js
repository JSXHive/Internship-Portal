import { pool } from "../../../../../lib/db"; 

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { 
    task_id, 
    title, 
    description, 
    due_date, 
    priority, 
    category, 
    estimated_hours, 
    resources, 
    status 
  } = req.body;

  console.log("Updating task:", task_id, "with data:", req.body);

  if (!task_id) {
    return res.status(400).json({ 
      success: false,
      message: "Task ID is required" 
    });
  }

  try {
    const result = await pool.query(
      `UPDATE student_tasks 
       SET title = $1, 
           description = $2, 
           due_date = $3, 
           priority = $4, 
           category = $5, 
           estimated_hours = $6,
           resources = $7, 
           status = $8, 
           updated_at = CURRENT_TIMESTAMP
       WHERE task_id = $9
       RETURNING *`,
      [
        title, 
        description, 
        due_date, 
        priority, 
        category,
        estimated_hours, 
        resources, 
        status, 
        task_id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Task not found" 
      });
    }

    console.log("Task updated successfully:", result.rows[0].task_id);

    res.status(200).json({
      success: true,
      task: result.rows[0],
      message: "Task updated successfully"
    });
  } catch (error) {
    console.error("Database error updating task:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
}