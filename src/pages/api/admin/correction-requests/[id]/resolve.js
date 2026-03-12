// pages/api/admin/correction-requests/[id]/resolve.js
import { pool } from '../../../../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const { admin_notes, status } = req.body;

  try {
    // Update the correction request
    const result = await pool.query(`
      UPDATE admin_notifications 
      SET 
        admin_notes = $1,
        status = $2,
        resolved_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `, [admin_notes, status, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Correction request not found' });
    }

    // Update the certificate status back to 'issued'
    const correctionRequest = result.rows[0];
    if (correctionRequest.certificate_id) {
      await pool.query(`
        UPDATE certificates 
        SET status = 'issued', updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [correctionRequest.certificate_id]);
    }

    res.status(200).json({
      message: 'Correction request resolved successfully',
      correctionRequest: result.rows[0]
    });
  } catch (error) {
    console.error('Error resolving correction request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}