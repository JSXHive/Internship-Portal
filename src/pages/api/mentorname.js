import { pool } from '../../../lib/db'; // ✅ Fixed import

export default async function handler(req, res) {
  const { studentId } = req.query;

  if (!studentId) {
    return res.status(400).json({ error: 'Student ID is required' });
  }

  try {
    // First, try to get mentor from task assignments
    const assignmentQuery = `
      SELECT DISTINCT u.name, u.user_id
      FROM student_tasks st
      JOIN users u ON st.assigned_by = u.user_id
      WHERE st.assigned_to = $1
      LIMIT 1
    `;

    const assignmentResult = await pool.query(assignmentQuery, [studentId]);

    if (assignmentResult.rows.length > 0) {
      return res.status(200).json({
        name: assignmentResult.rows[0].name,
        id: assignmentResult.rows[0].user_id
      });
    }

    // If no tasks found, try to get from admin assignments
    const adminAssignmentQuery = `
      SELECT u.name, u.user_id
      FROM admin_student_assignments asa
      JOIN users u ON asa.admin_id = u.user_id
      WHERE asa.student_id = $1
      LIMIT 1
    `;

    const adminResult = await pool.query(adminAssignmentQuery, [studentId]);

    if (adminResult.rows.length > 0) {
      return res.status(200).json({
        name: adminResult.rows[0].name,
        id: adminResult.rows[0].user_id
      });
    }

    // If no mentor found
    res.status(200).json({ name: 'Not assigned', id: null });
  } catch (error) {
    console.error('Error fetching mentor name:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}