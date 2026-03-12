import { pool } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { submission_id, feedback, marks, status, reviewed_by } = req.body;

  console.log('Review submission data:', { submission_id, feedback, marks, status, reviewed_by });

  if (!submission_id || !reviewed_by) {
    return res.status(400).json({ error: 'Submission ID and reviewer ID are required' });
  }

  try {
    if (!pool) {
      console.error('Database pool is not available');
      return res.status(500).json({ error: 'Database connection failed' });
    }

    const client = await pool.connect();
    
    try {
      // Update the deliverable with review information
      const result = await client.query(
        `UPDATE deliverables 
         SET feedback = $1, marks = $2, status = $3, reviewed_by = $4, reviewed_at = NOW()
         WHERE submission_id = $5
         RETURNING *`,
        [feedback, marks, status, reviewed_by, submission_id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Deliverable not found' });
      }

      const updatedDeliverable = result.rows[0];
      
      console.log('Deliverable reviewed successfully:', updatedDeliverable);

      res.status(200).json({
        success: true,
        message: 'Review submitted successfully',
        deliverable: updatedDeliverable
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}