import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '❌ Method not allowed' });
  }

  try {
    const uploadDir = path.join(process.cwd(), 'public', 'certificates');
    
    // Create upload directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log('Created upload directory:', uploadDir);
    }

    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      filter: function ({ name, originalFilename, mimetype }) {
        // Only allow PDF files
        return name === 'file' && mimetype && mimetype.includes('pdf');
      }
    });

    const [fields, files] = await form.parse(req);
    
    const file = files.file?.[0];
    if (!file) {
      return res.status(400).json({ error: '📄 No PDF file uploaded or invalid file type' });
    }

    // Get student_id from fields
    const studentId = fields.student_id?.[0] || 'unknown';
    
    if (studentId === 'unknown') {
      // Clean up the uploaded file
      fs.unlinkSync(file.filepath);
      return res.status(400).json({ error: '🎓 Student ID is required for file upload' });
    }

    // Generate new filename with student_id (same name for updates)
    const fileExtension = path.extname(file.originalFilename || file.newFilename);
    const newFilename = `Internship_Certificate_${studentId}${fileExtension}`;
    const newFilePath = path.join(uploadDir, newFilename);
    
    // If file already exists, delete it first (for updates)
    if (fs.existsSync(newFilePath)) {
      fs.unlinkSync(newFilePath);
    }
    
    // Rename the file to include student_id
    fs.renameSync(file.filepath, newFilePath);
    
    const filePath = `/certificates/${newFilename}`;
    
    console.log('File uploaded successfully:', newFilename);
    res.status(200).json({ 
      success: true, 
      filePath,
      fileName: newFilename,
      message: '📄 Certificate PDF uploaded successfully!'
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    
    if (error.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ error: '📁 File too large! Maximum size is 10MB.' });
    } else if (error.message.includes('file type')) {
      res.status(400).json({ error: '❌ Invalid file type! Please upload a PDF file.' });
    } else {
      res.status(500).json({ error: '🚨 File upload failed! Please try again.' });
    }
  }
}