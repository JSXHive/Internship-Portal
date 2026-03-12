import { pool } from '../../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query_id, answer, answered_by } = req.body;

    if (!query_id || !answer || !answered_by) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Update the query with answer using your actual schema
      const updateQuery = `
        UPDATE task_queries 
        SET answer = $1, 
            answer_date = CURRENT_TIMESTAMP, 
            status = 'answered'
        WHERE query_id = $2
        RETURNING *
      `;

      const result = await client.query(updateQuery, [answer, query_id]);

      if (result.rows.length === 0) {
        throw new Error('Query not found');
      }

      await client.query('COMMIT');

      res.status(200).json({ 
        message: 'Query answered successfully',
        query_id: query_id
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error answering query:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}