import { pool } from '../../../../../lib/db';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { certificateId } = req.query;
  const userId = req.headers['user-id'] || req.query.userId;

  if (!certificateId) {
    return res.status(400).json({ message: 'Certificate ID is required' });
  }

  try {
    // Verify ownership and get file path
    const result = await pool.query(
      `SELECT c.file_path, c.certificate_id, c.program_name, c.user_id
       FROM certificates c
       WHERE c.certificate_id = $1 AND ($2 IS NULL OR c.user_id = $2)`,
      [certificateId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found or access denied'
      });
    }

    const certificate = result.rows[0];

    if (!certificate.file_path) {
      return res.status(404).json({
        success: false,
        message: 'Certificate file not available yet'
      });
    }

    // Construct full file path (adjust based on your file storage)
    const filePath = path.join(process.cwd(), 'public', certificate.file_path);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Certificate file not found on server'
      });
    }

    // Set headers for file download
    const filename = `${certificate.certificate_id}_${certificate.program_name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Error downloading certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}