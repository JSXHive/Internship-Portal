import { promises as fs } from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { filePath } = req.query;

  if (!filePath) {
    return res.status(400).json({ error: 'File path is required' });
  }

  try {
    // Security check: prevent directory traversal
    const safePath = path.normalize(filePath).replace(/^(\.\.(\/|\\|$))+/, '');
    
    // Check if file exists
    try {
      await fs.access(safePath);
    } catch {
      return res.status(404).json({ error: 'File not found' });
    }

    const stats = await fs.stat(safePath);
    
    // Check if it's a file
    if (!stats.isFile()) {
      return res.status(400).json({ error: 'Path is not a file' });
    }

    // Set headers for file download
    const filename = path.basename(safePath);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Length', stats.size);

    // Create read stream and pipe to response
    const fileStream = fs.createReadStream(safePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('File download error:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
}