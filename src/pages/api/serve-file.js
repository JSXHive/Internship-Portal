// pages/api/serve-file.js
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { filePath } = req.query;

  if (!filePath) {
    return res.status(400).json({ error: 'File path is required' });
  }

  try {
    // For now, just return the file path - let the browser handle the download
    // This avoids memory issues with large files
    res.status(200).json({ 
      message: 'File available for download',
      filePath: filePath,
      downloadUrl: filePath // This assumes files are accessible via direct URL
    });
  } catch (error) {
    console.error('File serving error:', error);
    res.status(500).json({ error: 'Failed to serve file' });
  }
}