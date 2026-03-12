import { pool } from '../../../../lib/db';

export default async function handler(req, res) {
  try {
    const { mentorId } = req.query;

    if (!mentorId) {
      return res.status(400).json({ error: 'Mentor ID is required' });
    }

    // First get students assigned to this mentor
    const studentsQuery = 'SELECT student_id FROM mentor_students WHERE mentor_id = $1';
    const studentsResult = await pool.query(studentsQuery, [mentorId]);
    
    if (studentsResult.rows.length === 0) {
      return res.status(200).json({ deliverables: [] });
    }

    const studentIds = studentsResult.rows.map(row => row.student_id);

    // Then get deliverables only for these students
    const placeholders = studentIds.map((_, index) => `$${index + 1}`).join(',');
    const deliverablesQuery = `SELECT * FROM deliverables WHERE student_id IN (${placeholders})`;
    
    const result = await pool.query(deliverablesQuery, studentIds);
    res.status(200).json({ deliverables: result.rows });
  } catch (err) {
    console.error('Error fetching mentor deliverables:', err);
    res.status(500).json({ error: 'Failed to fetch deliverables', details: err.message });
  }
}