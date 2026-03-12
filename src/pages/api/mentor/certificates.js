import { pool } from '../../../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { status, search, mentorId } = req.query;
      
      if (!mentorId) {
        return res.status(400).json({ error: 'Mentor ID is required' });
      }

      const client = await pool.connect();
      
      try {
        console.log('Fetching certificates for mentor ID:', mentorId);

        // Get students assigned to this mentor directly from applications table using mentor ID
        const studentsQuery = `
          SELECT user_id, full_name as student_name
          FROM applications 
          WHERE mentor = $1
        `;
        const studentsResult = await client.query(studentsQuery, [mentorId]);
        
        console.log('Students assigned to mentor:', studentsResult.rows);

        if (studentsResult.rows.length === 0) {
          return res.json({ 
            certificates: [],
            total: 0,
            message: 'No students assigned to this mentor'
          });
        }

        const userIds = studentsResult.rows.map(row => row.user_id);

        // Get student_ids from users table using user_ids
        const studentIdsQuery = `
          SELECT user_id, student_id 
          FROM users 
          WHERE user_id IN (${userIds.map((_, index) => `$${index + 1}`).join(',')})
        `;
        const studentIdsResult = await client.query(studentIdsQuery, userIds);
        
        const studentIdMap = {};
        studentIdsResult.rows.forEach(row => {
          studentIdMap[row.user_id] = row.student_id;
        });

        console.log('Student ID map:', studentIdMap);

        // Get certificates for these students
        const studentIds = Object.values(studentIdMap);
        
        if (studentIds.length === 0) {
          return res.json({ 
            certificates: [],
            total: 0
          });
        }

        let query = `
          SELECT 
            c.id,
            c.student_id,
            c.student_name,
            c.program_name,
            c.issue_date,
            c.certificate_id,
            c.verification_id,
            c.file_path,
            c.duration,
            c.domain,
            c.status,
            c.issued_by,
            c.issued_at,
            c.verified_by,
            c.verified_at,
            c.created_at,
            c.updated_at,
            u.email as student_email,
            sp.college,
            sp.branch,
            sp.profile_photo
          FROM certificates c
          LEFT JOIN users u ON c.student_id = u.student_id
          LEFT JOIN student_profiles sp ON u.user_id = sp.user_id
          WHERE c.student_id IN (${studentIds.map((_, index) => `$${index + 1}`).join(',')})
        `;
        
        const params = [...studentIds];
        let paramCount = studentIds.length;

        if (status && status !== 'all') {
          paramCount++;
          query += ` AND c.status = $${paramCount}`;
          params.push(status);
        }

        if (search) {
          paramCount++;
          query += ` AND (
            c.student_name ILIKE $${paramCount} OR 
            u.email ILIKE $${paramCount} OR 
            c.certificate_id ILIKE $${paramCount} OR
            c.student_id ILIKE $${paramCount}
          )`;
          params.push(`%${search}%`);
        }

        query += ` ORDER BY c.created_at DESC`;

        console.log('Final query params:', params);
        const result = await client.query(query, params);

        console.log('Found certificates:', result.rows.length);

        res.json({ 
          certificates: result.rows,
          total: result.rows.length
        });
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error fetching mentor certificates:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}