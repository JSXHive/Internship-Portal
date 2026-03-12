import { pool } from '../../../lib/db';
import { createReadStream, createWriteStream, mkdirSync, existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import formidable from 'formidable';

// Disable Next.js body parsing
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper function to save file with streams
const saveWithStream = (file, uploadsDir, filename) => {
  return new Promise((resolve, reject) => {
    const filepath = join(uploadsDir, filename);
    
    // Use streams for better memory handling
    const readStream = createReadStream(file.filepath);
    const writeStream = createWriteStream(filepath);

    readStream.pipe(writeStream);
    
    writeStream.on('finish', () => {
      // Clean up temporary file
      try {
        unlinkSync(file.filepath);
      } catch (cleanupError) {
        console.warn('Could not delete temporary file:', cleanupError.message);
      }
      resolve(filename);
    });
    
    writeStream.on('error', (error) => {
      // Clean up temporary file on error
      try {
        unlinkSync(file.filepath);
      } catch (cleanupError) {
        console.warn('Could not delete temporary file:', cleanupError.message);
      }
      reject(error);
    });
    
    readStream.on('error', (error) => {
      // Clean up temporary file on error
      try {
        unlinkSync(file.filepath);
      } catch (cleanupError) {
        console.warn('Could not delete temporary file:', cleanupError.message);
      }
      reject(error);
    });
  });
};

// Save uploaded files - Updated to use mentor_name/student_id structure
const saveFile = async (file, mentorName, studentId) => {
  try {
    // Check if file is valid
    if (!file || !file.filepath || !file.originalFilename) {
      throw new Error('Invalid file object');
    }

    // Sanitize mentor name for folder path
    const sanitizedMentorName = mentorName.replace(/[^a-zA-Z0-9]/g, '_');
    
    // Use student_deliverables/mentors/mentor_name/student_id for folder structure
    const uploadsDir = join(
      process.cwd(), 
      'public', 
      'student_deliverables',
      'mentors', 
      sanitizedMentorName, 
      studentId
    );
    
    // Create directory if it doesn't exist
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true });
    }

    // Use original filename only (no timestamp)
    const filename = file.originalFilename;
    const filepath = join(uploadsDir, filename);

    // Check if file already exists and handle naming conflict
    if (existsSync(filepath)) {
      // If file exists, add a simple counter to the filename
      const nameParts = filename.split('.');
      const extension = nameParts.pop();
      const baseName = nameParts.join('.');
      
      let counter = 1;
      let newFilename = `${baseName}_${counter}.${extension}`;
      let newFilepath = join(uploadsDir, newFilename);
      
      while (existsSync(newFilepath)) {
        counter++;
        newFilename = `${baseName}_${counter}.${extension}`;
        newFilepath = join(uploadsDir, newFilename);
      }
      
      // Use the new filename with counter
      await saveWithStream(file, uploadsDir, newFilename);
      return `/student_deliverables/mentors/${sanitizedMentorName}/${studentId}/${newFilename}`;
    }
    
    // Use original filename if no conflict
    await saveWithStream(file, uploadsDir, filename);
    return `/student_deliverables/mentors/${sanitizedMentorName}/${studentId}/${filename}`;
  } catch (error) {
    throw new Error(`Failed to save file: ${error.message}`);
  }
};

// Parse multipart form
const parseForm = (req) => {
  return new Promise((resolve, reject) =>{
    const form = formidable({
      multiples: true,
      maxFiles: 10,
      maxFileSize: 10 * 1024 * 1024, // 10 MB
      keepExtensions: true,
    });

    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
};

// Check if pool is connected
const checkPoolConnection = async () => {
  if (!pool) {
    throw new Error('Database connection pool is not initialized');
  }
  
  try {
    // Test the connection
    const client = await pool.connect();
    client.release();
    return true;
  } catch (error) {
    throw new Error(`Database connection failed: ${error.message}`);
  }
};

// Generate sequential submission ID
const generateSubmissionId = async (studentId) => {
  try {
    // Get the latest submission for this student
    const result = await pool.query(
      `SELECT submission_id FROM deliverables 
       WHERE student_id = $1 
       ORDER BY created_at DESC LIMIT 1`,
      [studentId]
    );
    
    if (result.rows.length === 0) {
      // First submission for this student
      return `SUB${studentId}0001`;
    }
    
    // Extract the number from the latest submission ID
    const latestId = result.rows[0].submission_id;
    const match = latestId.match(new RegExp(`SUB${studentId}(\\d+)`));
    
    if (match && match[1]) {
      const nextNumber = parseInt(match[1]) + 1;
      return `SUB${studentId}${nextNumber.toString().padStart(4, '0')}`;
    }
    
    // If pattern doesn't match, create a new sequential ID
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM deliverables WHERE student_id = $1`,
      [studentId]
    );
    
    const count = parseInt(countResult.rows[0].count) + 1;
    return `SUB${studentId}${count.toString().padStart(4, '0')}`;
  } catch (error) {
    console.error('Error generating submission ID:', error);
    // Fallback to timestamp-based ID
    return `SUB${studentId}${Date.now().toString().slice(-4)}`;
  }
};

// Get user details including student_id from users table
const getUserDetails = async (userId) => {
  try {
    const result = await pool.query(
      `SELECT user_id, name, email, student_id FROM users WHERE user_id = $1`,
      [userId]
    );
    
    if (result.rows.length === 0) {
      throw new Error('User not found');
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error fetching user details:', error);
    throw new Error(`Failed to fetch user details: ${error.message}`);
  }
};

// Check if mentor is allocated to student and get mentor name
const checkMentorAllocated = async (userId) => {
  try {
    const result = await pool.query(
      `SELECT a.mentor, a.start_date, mp.name as mentor_name
       FROM applications a
       LEFT JOIN mentor_profiles mp ON a.mentor = mp.user_id
       WHERE a.user_id = $1`,
      [userId]
    );
    
    if (result.rows.length === 0) {
      throw new Error('Application not found for this user');
    }
    
    const application = result.rows[0];
    const hasMentor = application.mentor && application.mentor.trim() !== '';
    
    // Use mentor_name from mentor_profiles if available, otherwise use mentor ID
    const mentorName = application.mentor_name || application.mentor || '';
    
    const currentDate = new Date();
    const startDate = new Date(application.start_date);
    const internshipStarted = currentDate >= startDate;
    
    return {
      hasMentor,
      internshipStarted,
      mentorName: mentorName,
      mentorId: application.mentor || '',
      startDate: application.start_date
    };
  } catch (error) {
    console.error('Error checking mentor allocation:', error);
    throw new Error(`Failed to check mentor allocation: ${error.message}`);
  }
};

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Check database connection first
    await checkPoolConnection();
  } catch (dbError) {
    console.error('Database connection error:', dbError);
    return res.status(500).json({ error: 'Database connection failed: ' + dbError.message });
  }

  if (req.method === 'GET') {
    // Handle GET request for fetching deliverables history
    const { user_id } = req.query;
    
    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    try {
      // First get the user details including student_id from users table
      const userDetails = await getUserDetails(user_id);
      
      if (!userDetails.student_id) {
        return res.status(400).json({ error: 'Student ID not found for this user' });
      }
      
      // Then fetch deliverables using student_id
      const result = await pool.query(
        `SELECT d.*, u.name, u.email, u.student_id
         FROM deliverables d
         JOIN users u ON d.user_id = u.user_id
         WHERE d.student_id = $1 
         ORDER BY d.submission_date DESC, d.created_at DESC`,
        [userDetails.student_id]
      );
      
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching deliverables:', error);
      res.status(500).json({ error: 'Internal server error: ' + error.message });
    }
  } else if (req.method === 'POST') {
    // Handle POST request for submitting deliverables
    try {
      const { fields, files } = await parseForm(req);
      const user_id = Array.isArray(fields.user_id) ? fields.user_id[0] : fields.user_id;
      const date = Array.isArray(fields.date) ? fields.date[0] : fields.date;
      const remarks = Array.isArray(fields.remark) ? fields.remark[0] : fields.remark;

      // Validate required fields
      if (!user_id || !date || !remarks) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Check if mentor is allocated and internship has started
      const mentorCheck = await checkMentorAllocated(user_id);
      if (!mentorCheck.hasMentor) {
        return res.status(400).json({ 
          error: 'Mentor not allocated. You cannot submit deliverables until a mentor has been assigned to you.' 
        });
      }
      
      if (!mentorCheck.internshipStarted) {
        return res.status(400).json({ 
          error: `Internship has not started yet. You can submit deliverables starting from ${new Date(mentorCheck.startDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}` 
        });
      }

      // Get user details including student_id from users table
      const userDetails = await getUserDetails(user_id);
      
      if (!userDetails.student_id) {
        return res.status(400).json({ 
          error: 'Student ID not assigned. Please contact administrator to assign a student ID.' 
        });
      }
      
      const student_id = userDetails.student_id;
      const mentor_name = mentorCheck.mentorName;

      // Validate date
      const today = new Date().toISOString().split('T')[0];
      if (date > today) {
        return res.status(400).json({ error: 'Date cannot be in the future' });
      }

      // Handle files - formidable returns different structures based on number of files
      let uploadedFiles = [];
      if (files.files) {
        if (Array.isArray(files.files)) {
          uploadedFiles = files.files;
        } else {
          uploadedFiles = [files.files];
        }
      }
      
      if (uploadedFiles.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }

      const filePaths = [];
      for (const file of uploadedFiles) {
        try {
          // Check if file is valid (not empty)
          if (file && file.originalFilename && file.originalFilename !== '') {
            // Use mentor_name/student_id for file storage with original filename
            const filePath = await saveFile(file, mentor_name, student_id);
            filePaths.push(filePath);
          }
        } catch (error) {
          console.error('Error saving file:', error);
          return res.status(500).json({ error: `Failed to save file: ${error.message}` });
        }
      }

      if (filePaths.length === 0) {
        return res.status(400).json({ error: 'No valid files were uploaded' });
      }

      // Generate sequential submission ID
      const submission_id = await generateSubmissionId(student_id);

      // Insert into DB - include student_id in the query
      const query = `
        INSERT INTO deliverables (
          submission_id, user_id, student_id, submission_date, remarks, file_paths, status
        )
        VALUES ($1, $2, $3, $4, $5, $6, 'submitted')
        RETURNING *;
      `;

      const result = await pool.query(query, [
        submission_id,
        user_id,
        student_id,
        date,
        remarks,
        filePaths,
      ]);

      return res.status(201).json({
        message: 'Deliverables submitted successfully',
        submission: result.rows[0],
      });
    } catch (error) {
      console.error('Error in deliverables API:', error);
      return res.status(500).json({ error: 'Internal server error: ' + error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}