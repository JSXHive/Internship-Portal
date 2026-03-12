// import { pool } from '../../../lib/db';
import { pool } from "@/lib/db";

export default async function handler(req, res) {
  const { method, query, body } = req;

  switch (method) {
    case 'GET':
      try {
        const { userId } = query;
        
        if (!userId) {
          return res.status(400).json({ error: 'User ID is required' });
        }

        // Get sent emails
        const sentEmailsResult = await pool.query(
          `SELECT * FROM mentor_emails 
           WHERE student_id = $1 AND direction = 'sent' 
           ORDER BY created_at DESC`,
          [userId]
        );

        // Get received emails
        const receivedEmailsResult = await pool.query(
          `SELECT * FROM mentor_emails 
           WHERE student_id = $1 AND direction = 'received' 
           ORDER BY created_at DESC`,
          [userId]
        );

        res.status(200).json({
          sent: sentEmailsResult.rows,
          received: receivedEmailsResult.rows
        });
      } catch (error) {
        console.error('Error fetching emails:', error);
        res.status(500).json({ error: 'Failed to fetch emails' });
      }
      break;

    case 'POST':
      try {
        const { userId, subject, content, direction } = body;
        
        if (!userId || !subject || !content || !direction) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        const result = await pool.query(
          `INSERT INTO mentor_emails (student_id, subject, content, direction, created_at)
           VALUES ($1, $2, $3, $4, NOW())
           RETURNING *`,
          [userId, subject, content, direction]
        );

        res.status(201).json(result.rows[0]);
      } catch (error) {
        console.error('Error creating email:', error);
        res.status(500).json({ error: 'Failed to create email' });
      }
      break;

    case 'DELETE':
      try {
        const { userId, type } = body;
        
        if (!userId || !type) {
          return res.status(400).json({ error: 'User ID and type are required' });
        }

        await pool.query(
          `DELETE FROM mentor_emails 
           WHERE student_id = $1 AND direction = $2`,
          [userId, type]
        );

        res.status(200).json({ message: 'Emails deleted successfully' });
      } catch (error) {
        console.error('Error deleting emails:', error);
        res.status(500).json({ error: 'Failed to delete emails' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}