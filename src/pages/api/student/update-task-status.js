// import { pool } from '../../../../lib/db';
import { pool } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { task_id, status } = req.body;

  if (!task_id || !status) {
    return res.status(400).json({ error: 'Task ID and status are required' });
  }

  try {
    const updateQuery = `
      UPDATE student_tasks 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE task_id = $2
      RETURNING *
    `;

    const result = await pool.query(updateQuery, [status, task_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(200).json({
      message: 'Task status updated successfully',
      task: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}