import { pool } from '../../../../lib/db';
import fs from 'fs';
import path from 'path';
import formidable from 'formidable';
import { promises as fsPromises } from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({
      multiples: true,
      maxFileSize: 10 * 1024 * 1024,
      keepExtensions: true,
    });

    const [fields, files] = await form.parse(req);
    
    const task_id = fields.task_id?.[0];
    const student_id = fields.student_id?.[0];
    const remarks = fields.remarks?.[0];
    const submission_date = fields.submission_date?.[0] || new Date().toISOString();

    console.log('Received submission:', { task_id, student_id, remarks });

    if (!task_id || !student_id || !remarks) {
      return res.status(400).json({ 
        error: 'Task ID, Student ID, and remarks are required',
        received: { task_id, student_id, remarks: remarks ? 'provided' : 'missing' }
      });
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Get task details including mentor and student information
      const taskDetailsQuery = `
        SELECT st.*, 
               mentor.name as mentor_name, 
               mentor.user_id as mentor_id,
               student.name as student_name,
               student.user_id as student_id
        FROM student_tasks st
        JOIN users mentor ON st.assigned_by = mentor.user_id
        JOIN users student ON st.assigned_to = student.user_id
        WHERE st.task_id = $1 AND st.assigned_to = $2
      `;
      
      const taskDetailsResult = await client.query(taskDetailsQuery, [task_id, student_id]);
      
      if (taskDetailsResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Task not found or access denied' });
      }

      const taskDetails = taskDetailsResult.rows[0];
      const mentorName = taskDetails.mentor_name.replace(/\s+/g, '_').toLowerCase();
      const studentName = taskDetails.student_name.replace(/\s+/g, '_').toLowerCase();
      const taskName = taskDetails.title.replace(/\s+/g, '_').toLowerCase();

      // Check if submission already exists
      const existingSubmission = await client.query(
        'SELECT * FROM task_submissions WHERE task_id = $1 AND student_id = $2',
        [task_id, student_id]
      );

      if (existingSubmission.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(409).json({
          error: 'Submission already exists. Use the edit endpoint to update it.',
          submission_id: existingSubmission.rows[0].submission_id
        });
      }

      // Create directory structure
      const baseDir = path.join(process.cwd(), 'public', 'tasks');
      const taskDir = path.join(baseDir, mentorName, studentName, taskName);
      
      if (!fs.existsSync(taskDir)) {
        fs.mkdirSync(taskDir, { recursive: true });
        console.log('Created directory:', taskDir);
      }

      // Process file uploads
      const filePaths = [];
      const uploadedFiles = files.files || [];

      for (const file of uploadedFiles) {
        const originalFileName = file.originalFilename || `file_${Date.now()}`;
        
        const sanitizedFileName = originalFileName
          .replace(/[^a-zA-Z0-9.\-_]/g, '_')
          .replace(/_+/g, '_')
          .replace(/^_+|_+$/g, '');
        
        const fileName = sanitizedFileName;
        const relativePath = `/tasks/${mentorName}/${studentName}/${taskName}/${fileName}`;
        const fullPath = path.join(process.cwd(), 'public', relativePath);
        
        let finalFileName = fileName;
        let finalFullPath = fullPath;
        let counter = 1;
        
        while (fs.existsSync(finalFullPath)) {
          const nameWithoutExt = path.parse(fileName).name;
          const ext = path.parse(fileName).ext;
          finalFileName = `${nameWithoutExt}_${counter}${ext}`;
          finalFullPath = path.join(process.cwd(), 'public', `/tasks/${mentorName}/${studentName}/${taskName}/${finalFileName}`);
          counter++;
        }
        
        const fileData = await fsPromises.readFile(file.filepath);
        await fsPromises.writeFile(finalFullPath, fileData);
        
        filePaths.push(`/tasks/${mentorName}/${studentName}/${taskName}/${finalFileName}`);
        
        console.log('File saved:', {
          original: originalFileName,
          savedAs: finalFileName,
          path: `/tasks/${mentorName}/${studentName}/${taskName}/${finalFileName}`
        });
      }

      // Insert task submission
      const submissionQuery = `
        INSERT INTO task_submissions (
          task_id, 
          student_id, 
          remarks, 
          submission_date,
          file_paths,
          status
        ) VALUES ($1, $2, $3, $4, $5, 'submitted')
        RETURNING *
      `;

      const submissionResult = await client.query(submissionQuery, [
        task_id,
        student_id,
        remarks,
        submission_date,
        filePaths.length > 0 ? filePaths : null
      ]);

      // FIXED: Update student_tasks status to 'submitted' instead of 'completed'
      const updateTaskQuery = `
        UPDATE student_tasks 
        SET status = 'submitted', updated_at = CURRENT_TIMESTAMP 
        WHERE task_id = $1
      `;
      await client.query(updateTaskQuery, [task_id]);

      await client.query('COMMIT');

      res.status(201).json({
        message: 'Task submitted successfully',
        submission: submissionResult.rows[0],
        files_uploaded: filePaths.length,
        file_paths: filePaths,
        directory_structure: {
          base: '/public/tasks',
          mentor: mentorName,
          student: studentName,
          task: taskName
        },
        preserved_filenames: filePaths.map(fp => path.basename(fp))
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Database error:', error);
      
      if (error.code === '23514') {
        return res.status(400).json({
          error: 'Invalid data provided',
          details: 'One or more field values violate database constraints',
          hint: 'Check allowed status values for student_tasks: pending, in-progress, submitted, completed, reviewed'
        });
      }
      
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error submitting task:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}