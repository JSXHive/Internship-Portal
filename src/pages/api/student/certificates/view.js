import { pool } from '../../../../../lib/db';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { certificateId } = req.query;

  if (!certificateId) {
    return res.status(400).json({ error: 'Certificate ID is required' });
  }

  try {
    // Get certificate file path
    const certificateQuery = 'SELECT file_path FROM certificates WHERE id = $1';
    const certificateResult = await pool.query(certificateQuery, [certificateId]);

    if (certificateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    const certificate = certificateResult.rows[0];
    
    // Construct absolute path to public folder
    let filePath = certificate.file_path;
    if (filePath.startsWith('/certificates/')) {
      filePath = path.join(process.cwd(), 'public', filePath);
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Certificate file not found at: ' + filePath });
    }

    // Set headers for inline viewing
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Error viewing certificate:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}