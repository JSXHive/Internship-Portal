// import { pool } from "../../../../lib/db";
import { pool } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ 
      success: false,
      message: "Method not allowed" 
    });
  }

  const { 
    title, 
    description, 
    due_date, 
    priority, 
    category, 
    estimated_hours, 
    resources, 
    assigned_by, 
    assigned_to 
  } = req.body;

  console.log("Creating task with data:", {
    title, assigned_by, assigned_to, priority, category
  });

  if (!title || !assigned_by || !assigned_to) {
    return res.status(400).json({ 
      success: false,
      message: "Title, assigned_by, and assigned_to are required",
      received: { title, assigned_by, assigned_to }
    });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Check if relationship exists, if not create it automatically
    const verification = await client.query(
      `SELECT 1 FROM mentor_student_assignments 
       WHERE mentor_id = $1 AND student_id = $2`,
      [assigned_by, assigned_to]
    );

    console.log("Verification result:", verification.rows);

    if (verification.rows.length === 0) {
      console.log("Creating automatic mentor-student relationship...");
      
      // Auto-create the relationship
      await client.query(
        `INSERT INTO mentor_student_assignments (mentor_id, student_id, status)
         VALUES ($1, $2, 'active')`,
        [assigned_by, assigned_to]
      );
      
      console.log("Auto-created relationship for mentor:", assigned_by, "student:", assigned_to);
    }

    // Handle null values for optional fields
    const finalDueDate = due_date || null;
    const finalEstimatedHours = estimated_hours || null;
    const finalResources = resources || null;
    const finalCategory = category || 'General';
    const finalPriority = priority || 'medium';
    const finalDescription = description || '';

    // Create the task
    const result = await client.query(
      `INSERT INTO student_tasks 
       (title, description, due_date, priority, category, 
        estimated_hours, resources, assigned_by, assigned_to, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending', CURRENT_TIMESTAMP)
       RETURNING *`,
      [
        title, 
        finalDescription, 
        finalDueDate, 
        finalPriority, 
        finalCategory,
        finalEstimatedHours, 
        finalResources, 
        assigned_by, 
        assigned_to
      ]
    );

    await client.query('COMMIT');

    console.log("Task created successfully:", result.rows[0].task_id);

    res.status(201).json({
      success: true,
      task: result.rows[0],
      message: "Task created successfully"
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Database error creating task:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error",
      error: error.message
    });
  } finally {
    client.release();
  }
}