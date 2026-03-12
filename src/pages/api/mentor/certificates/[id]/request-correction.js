// import { pool } from '../../../../../../lib/db';
import { pool } from "@/lib/db";

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'POST') {
    try {
      const { correction_message } = req.body;

      if (!correction_message) {
        return res.status(400).json({ error: 'Correction message is required' });
      }

      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');

        console.log('Processing correction request for certificate:', id);

        // Get certificate details including student_id
        const certificateResult = await client.query(
          `SELECT 
            id, student_id, student_name, certificate_id, program_name 
           FROM certificates 
           WHERE id = $1`,
          [id]
        );

        if (certificateResult.rows.length === 0) {
          await client.query('ROLLBACK');
          return res.status(404).json({ error: 'Certificate not found' });
        }

        const certificate = certificateResult.rows[0];
        console.log('Certificate found for student:', certificate.student_id);

        // Find the allocated mentor for this specific student from applications
        const applicationResult = await client.query(
          `SELECT a.mentor 
           FROM applications a 
           JOIN users u ON a.user_id = u.user_id 
           WHERE u.student_id = $1 
           ORDER BY a.created_at DESC 
           LIMIT 1`,
          [certificate.student_id]
        );

        console.log('Application query result:', applicationResult.rows);

        let mentor = null;

        if (applicationResult.rows.length > 0 && applicationResult.rows[0].mentor) {
          const mentorId = applicationResult.rows[0].mentor;
          console.log('Found allocated mentor ID:', mentorId);
          
          // Get mentor details from mentor_profiles using mentor ID
          const mentorResult = await client.query(
            `SELECT user_id, name, email FROM mentor_profiles WHERE user_id = $1`,
            [mentorId]
          );

          console.log('Mentor profile query result:', mentorResult.rows);

          if (mentorResult.rows.length > 0) {
            mentor = mentorResult.rows[0];
            console.log('Using allocated mentor:', mentor);
          } else {
            console.log('No mentor found with ID:', mentorId);
            await client.query('ROLLBACK');
            return res.status(404).json({ 
              error: `Mentor profile not found for: ${mentorId}`,
              allocated_mentor_id: mentorId,
              student_id: certificate.student_id
            });
          }
        } else {
          await client.query('ROLLBACK');
          return res.status(404).json({ 
            error: `No mentor allocated for student ${certificate.student_id}`,
            student_id: certificate.student_id
          });
        }

        // Create admin notification with actual mentor data
        const notificationResult = await client.query(
          `INSERT INTO admin_notifications (
            certificate_id, student_id, student_name, certificate_number, 
            mentor_id, mentor_name, message, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
          RETURNING *`,
          [
            certificate.id,
            certificate.student_id,
            certificate.student_name,
            certificate.certificate_id,
            mentor.user_id,
            mentor.name,
            correction_message
          ]
        );

        console.log('Notification created:', notificationResult.rows[0]);

        // Update certificate status to 'correction_requested'
        await client.query(
          `UPDATE certificates 
           SET status = 'correction_requested', updated_at = CURRENT_TIMESTAMP 
           WHERE id = $1`,
          [id]
        );

        await client.query('COMMIT');

        res.json({ 
          success: true, 
          notification: notificationResult.rows[0],
          message: 'Correction request submitted successfully',
          mentor_used: {
            id: mentor.user_id,
            name: mentor.name,
            email: mentor.email
          }
        });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error submitting correction request:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}