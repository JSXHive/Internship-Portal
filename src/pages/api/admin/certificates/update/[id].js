import { pool } from "@/lib/db";
import fs from 'fs';
import path from 'path';

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
        return res.status(404).json({ error: 'Certificate not found' });
      }
      
      res.status(200).json({ certificate: result.rows[0] });
    } catch (error) {
      console.error('Error fetching certificate:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { program_name, issue_date, duration, skills, file_path } = req.body;
      
      let query = `UPDATE certificates SET`;
      const params = [id];
      let paramCount = 1;
      const updates = [];

      if (program_name) {
        paramCount++;
        updates.push(` program_name = $${paramCount}`);
        params.push(program_name);
      }

      if (issue_date) {
        paramCount++;
        updates.push(` issue_date = $${paramCount}`);
        params.push(issue_date);
      }

      if (duration) {
        paramCount++;
        updates.push(` duration = $${paramCount}`);
        params.push(duration);
      }

      if (skills) {
        paramCount++;
        updates.push(` skills = $${paramCount}`);
        params.push(skills);
      }

      if (file_path) {
        paramCount++;
        updates.push(` file_path = $${paramCount}`);
        params.push(file_path);
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      query += updates.join(',');
      query += ` WHERE id = $1 RETURNING *`;

      const result = await pool.query(query, params);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Certificate not found' });
      }
      
      res.status(200).json({ certificate: result.rows[0] });
    } catch (error) {
      console.error('Error updating certificate:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'DELETE') {
    try {
      // First, get the certificate to check if it has a file
      const certificateCheck = await pool.query(
        'SELECT file_path FROM certificates WHERE id = $1',
        [id]
      );

      if (certificateCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Certificate not found' });
      }

      const certificate = certificateCheck.rows[0];
      
      // Delete the certificate from database
      const result = await pool.query('DELETE FROM certificates WHERE id = $1 RETURNING *', [id]);
      
      // If there's a file path, delete the physical file too
      if (certificate.file_path && certificate.file_path !== '') {
        try {
          const filePath = path.join(process.cwd(), 'public', certificate.file_path);
          
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log('Deleted certificate file:', filePath);
          }
        } catch (fileError) {
          console.error('Error deleting certificate file:', fileError);
          // Continue with the response even if file deletion fails
        }
      }
      
      res.status(200).json({ 
        message: 'Certificate deleted successfully',
        deletedCertificate: result.rows[0]
      });
    } catch (error) {
      console.error('Error deleting certificate:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}