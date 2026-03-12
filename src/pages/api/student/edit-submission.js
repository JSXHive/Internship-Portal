// import { pool } from '../../../../lib/db';
import { pool } from "@/lib/db";
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
  if (req.method === 'PUT') {
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
      const existing_files = fields.existing_files ? JSON.parse(fields.existing_files[0]) : [];

      console.log('Received update request:', { task_id, student_id, remarks, submission_date });

      if (!task_id || !student_id) {
        return res.status(400).json({ error: 'Task ID and Student ID are required' });
      }

      if (!pool) {
        console.error('Database pool is not available');
        return res.status(500).json({ error: 'Database connection failed' });
      }

      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');

        // Get current submission details with mentor and student info
        const currentSubmission = await client.query(
          `SELECT ts.*, st.title as task_title, st.assigned_by as mentor_id,
                  u_mentor.name as mentor_name, u_student.name as student_name
           FROM task_submissions ts
           JOIN student_tasks st ON ts.task_id = st.task_id
           JOIN users u_mentor ON st.assigned_by = u_mentor.user_id
           JOIN users u_student ON st.assigned_to = u_student.user_id
           WHERE ts.task_id = $1 AND ts.student_id = $2`,
          [task_id, student_id]
        );

        if (currentSubmission.rows.length === 0) {
          return res.status(404).json({ error: 'Submission not found' });
        }

        const currentData = currentSubmission.rows[0];
        
        const mentorName = currentData.mentor_name.replace(/\s+/g, '_').toLowerCase();
        const studentName = currentData.student_name.replace(/\s+/g, '_').toLowerCase();
        const taskName = currentData.task_title.replace(/\s+/g, '_').toLowerCase();

        const existingFilesArray = Array.isArray(existing_files) ? existing_files : [existing_files];
        
        const newFilePaths = [];
        const baseDir = path.join(process.cwd(), 'public', 'tasks');
        const taskDir = path.join(baseDir, mentorName, studentName, taskName);
        
        if (!fs.existsSync(taskDir)) {
          fs.mkdirSync(taskDir, { recursive: true });
        }

        const uploadedFiles = files.new_files || [];
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
          
          newFilePaths.push(`/tasks/${mentorName}/${studentName}/${taskName}/${finalFileName}`);
          
          console.log('File saved during edit:', {
            original: originalFileName,
            savedAs: finalFileName,
            path: `/tasks/${mentorName}/${studentName}/${taskName}/${finalFileName}`
          });
        }

        const updatedFilePaths = [
          ...existingFilesArray.filter(path => path && path.trim() !== ''),
          ...newFilePaths
        ];

        console.log('Updating submission with file paths:', updatedFilePaths);

        const result = await client.query(
          `UPDATE task_submissions 
           SET remarks = COALESCE($1, remarks), 
               submission_date = COALESCE($2, submission_date), 
               file_paths = $3, 
               updated_at = CURRENT_TIMESTAMP,
               status = 'submitted'
           WHERE task_id = $4 AND student_id = $5
           RETURNING *`,
          [
            remarks || currentData.remarks,
            submission_date || currentData.submission_date,
            updatedFilePaths.length > 0 ? updatedFilePaths : currentData.file_paths,
            task_id, 
            student_id
          ]
        );

        // FIXED: Keep status as 'submitted' for student_tasks when editing
        const updateTaskQuery = `
          UPDATE student_tasks 
          SET status = 'submitted', updated_at = CURRENT_TIMESTAMP 
          WHERE task_id = $1
        `;
        await client.query(updateTaskQuery, [task_id]);

        await client.query('COMMIT');

        console.log('Submission updated successfully');

        res.status(200).json({ 
          submission: result.rows[0],
          message: 'Submission updated successfully',
          files_added: newFilePaths.length,
          preserved_filenames: newFilePaths.map(fp => path.basename(fp)),
          directory_structure: {
            base: '/public/tasks',
            mentor: mentorName,
            student: studentName,
            task: taskName
          }
        });
      } catch (error) {
        await client.query('ROLLBACK');
        console.error('Database error during update:', error);
        
        if (error.code === '23514') {
          return res.status(400).json({
            error: 'Invalid data provided',
            details: 'One or more field values violate database constraints',
            hint: 'Check allowed status values for task_submissions table'
          });
        }
        
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error updating submission:', error);
      
      res.status(500).json({ 
        error: 'Internal server error',
        details: error.message,
        hint: 'Check if the status value is valid'
      });
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}