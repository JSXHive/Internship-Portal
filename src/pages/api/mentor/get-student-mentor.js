import { pool } from '../../../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { student_id } = req.query;

      if (!student_id) {
        return res.status(400).json({ error: 'Student ID is required' });
      }

      const client = await pool.connect();
      
      try {
        console.log('Fetching mentor for student:', student_id);
        
        // Find the application for this student to get the allocated mentor ID
        const applicationResult = await client.query(
          `SELECT a.mentor 
           FROM applications a 
           JOIN users u ON a.user_id = u.user_id 
           WHERE u.student_id = $1 
           ORDER BY a.created_at DESC 
           LIMIT 1`,
          [student_id]
        );

        console.log('Application result:', applicationResult.rows);

        if (applicationResult.rows.length === 0) {
          return res.status(404).json({ 
            error: 'No application found for student: ' + student_id,
            student_id: student_id
          });
        }

        const application = applicationResult.rows[0];
        
        if (!application.mentor) {
          return res.status(404).json({ 
            error: 'No mentor allocated for student: ' + student_id,
            student_id: student_id
          });
        }

        const mentorId = application.mentor;
        console.log('Found mentor ID:', mentorId);

        // Get mentor details from mentor_profiles using the mentor ID
        const mentorResult = await client.query(
          `SELECT user_id, name, email, contact_no, designation, 
                  area_of_expertise, years_of_experience, bio, profile_photo
           FROM mentor_profiles 
           WHERE user_id = $1`,
          [mentorId]
        );

        console.log('Mentor profile result:', mentorResult.rows);

        if (mentorResult.rows.length === 0) {
          return res.status(404).json({ 
            error: 'Mentor profile not found for ID: ' + mentorId,
            allocated_mentor_id: mentorId,
            student_id: student_id
          });
        }

        res.json({ 
          mentor: mentorResult.rows[0],
          allocated_mentor_id: mentorId,
          student_id: student_id
        });
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error fetching student mentor:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}