import { pool } from "@/lib/db";

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const query = `
        SELECT 
          c.*,
          u.name as student_name,
          u.email as student_email,
          u.student_id,
          sp.college,
          sp.branch,
          sp.profile_photo,
          issued_admin.name as issued_by_name,
          verified_admin.name as verified_by_name
        FROM certificates c
        JOIN users u ON c.student_id = u.student_id
        LEFT JOIN student_profiles sp ON u.user_id = sp.user_id
        LEFT JOIN users issued_admin ON c.issued_by = issued_admin.user_id
        LEFT JOIN users verified_admin ON c.verified_by = verified_admin.user_id
        WHERE c.id = $1
      `;
      
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: '📜 Certificate not found' });
      }
      
      res.status(200).json({ certificate: result.rows[0] });
    } catch (error) {
      console.error('Error fetching certificate:', error);
      res.status(500).json({ error: '🚨 Internal server error' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { program_name, issue_date, duration, domain, file_path } = req.body;
      
      console.log('Updating certificate:', id, { program_name, issue_date, duration, domain, file_path });
      
      let query = `UPDATE certificates SET updated_at = CURRENT_TIMESTAMP`;
      const params = [id];
      let paramCount = 1;

      if (program_name !== undefined) {
        paramCount++;
        query += `, program_name = $${paramCount}`;
        params.push(program_name);
      }

      if (issue_date !== undefined) {
        paramCount++;
        query += `, issue_date = $${paramCount}`;
        params.push(issue_date);
      }

      if (duration !== undefined) {
        paramCount++;
        query += `, duration = $${paramCount}`;
        params.push(duration);
      }

      if (domain !== undefined) {
        paramCount++;
        query += `, domain = $${paramCount}`;
        params.push(domain);
      }

      if (file_path !== undefined) {
        paramCount++;
        query += `, file_path = $${paramCount}`;
        params.push(file_path);
      }

      query += ` WHERE id = $1 RETURNING *`;

      const result = await pool.query(query, params);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: '📜 Certificate not found' });
      }
      
      console.log('Certificate updated successfully:', result.rows[0].id);
      res.status(200).json({ 
        certificate: result.rows[0],
        message: '✅ Certificate updated successfully!'
      });
    } catch (error) {
      console.error('Error updating certificate:', error);
      res.status(500).json({ error: '🚨 Internal server error' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const result = await pool.query('DELETE FROM certificates WHERE id = $1 RETURNING *', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: '📜 Certificate not found' });
      }
      
      console.log('Certificate deleted successfully:', id);
      res.status(200).json({ 
        message: '🗑️ Certificate deleted successfully!',
        deletedCertificate: result.rows[0]
      });
    } catch (error) {
      console.error('Error deleting certificate:', error);
      res.status(500).json({ error: '🚨 Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}