import { pool } from '../../../../../lib/db';

export default async function handler(req, res) {
  const { id } = req.query;

  // Log the request for debugging
  console.log(`API Request: ${req.method} /api/mentor/correction-requests/${id}`);

  if (req.method === 'PUT') {
    // Update correction request
    try {
      const { message } = req.body;

      console.log('Update request body:', { id, message });

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const client = await pool.connect();
      
      try {
        const result = await client.query(
          `UPDATE admin_notifications 
           SET message = $1, updated_at = CURRENT_TIMESTAMP 
           WHERE id = $2 AND status = 'pending'
           RETURNING *`,
          [message, id]
        );

        console.log('Update result:', result.rows.length);

        if (result.rows.length === 0) {
          return res.status(404).json({ 
            error: 'Correction request not found or already processed',
            details: `No pending correction request found with id: ${id}`
          });
        }

        res.json({ 
          success: true, 
          correctionRequest: result.rows[0],
          message: 'Correction request updated successfully'
        });
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error updating correction request:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        details: error.message 
      });
    }
  } 
  else if (req.method === 'DELETE') {
    // Delete correction request and update certificate status
    try {
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');

        // Get the correction request details
        const correctionRequest = await client.query(
          `SELECT certificate_id FROM admin_notifications WHERE id = $1`,
          [id]
        );

        if (correctionRequest.rows.length === 0) {
          await client.query('ROLLBACK');
          return res.status(404).json({ error: 'Correction request not found' });
        }

        const certificateId = correctionRequest.rows[0].certificate_id;

        // Delete the correction request
        await client.query(
          'DELETE FROM admin_notifications WHERE id = $1',
          [id]
        );

        // Update certificate status back to 'issued'
        await client.query(
          `UPDATE certificates 
           SET status = 'issued', updated_at = CURRENT_TIMESTAMP 
           WHERE id = $1`,
          [certificateId]
        );

        await client.query('COMMIT');

        res.json({ 
          success: true, 
          message: 'Correction request deleted and certificate status updated'
        });
      } finally {
        client.release();
      }
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error deleting correction request:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } 
  else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}