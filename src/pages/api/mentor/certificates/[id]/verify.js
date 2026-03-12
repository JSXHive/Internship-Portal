// import { pool } from '../../../../../../lib/db';
import { pool } from "@/lib/db";

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'PUT') {
    try {
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');

        // Get current certificate status and student_id
        const certificateResult = await client.query(
          `SELECT status, student_id FROM certificates WHERE id = $1`,
          [id]
        );

        if (certificateResult.rows.length === 0) {
          await client.query('ROLLBACK');
          return res.status(404).json({ error: 'Certificate not found' });
        }

        const currentStatus = certificateResult.rows[0].status;
        const studentId = certificateResult.rows[0].student_id;
        let newStatus;
        let action;

        // Find the mentor allocated to this student from applications
        let mentorId = 'system'; // default fallback

        const applicationResult = await client.query(
          `SELECT mentor 
           FROM applications 
           WHERE user_id IN (
             SELECT user_id FROM users WHERE student_id = $1
           ) 
           ORDER BY created_at DESC 
           LIMIT 1`,
          [studentId]
        );

        if (applicationResult.rows.length > 0 && applicationResult.rows[0].mentor) {
          const mentorName = applicationResult.rows[0].mentor;
          
          // Get mentor user_id from mentor_profiles
          const mentorResult = await client.query(
            `SELECT user_id FROM mentor_profiles WHERE name = $1`,
            [mentorName]
          );

          if (mentorResult.rows.length > 0) {
            mentorId = mentorResult.rows[0].user_id;
          }
        }

        if (currentStatus === 'issued' || currentStatus === 'correction_requested') {
          // Verify the certificate
          newStatus = 'verified';
          action = 'verified';
          await client.query(
            `UPDATE certificates 
             SET status = $1, verified_at = CURRENT_TIMESTAMP, verified_by = $2
             WHERE id = $3`,
            [newStatus, mentorId, id]
          );
        } else if (currentStatus === 'verified') {
          // Unverify the certificate
          newStatus = 'issued';
          action = 'unverified';
          await client.query(
            `UPDATE certificates 
             SET status = $1, verified_at = NULL, verified_by = NULL
             WHERE id = $2`,
            [newStatus, id]
          );
        }

        await client.query('COMMIT');

        res.json({ 
          success: true, 
          action: action,
          message: `Certificate ${action} successfully`
        });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error verifying certificate:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}