import { pool } from '../../../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { status, search } = req.query;
      
      let query = `
        SELECT 
          c.*,
          u.name as student_name,
          u.email as student_email,
          u.student_id,
          sp.college,
          sp.branch,
          sp.profile_photo,
          issued_admin.name as issued_by_name,
          verified_admin.name as verified_by_name
        FROM certificates c
        JOIN users u ON c.student_id = u.student_id
        LEFT JOIN student_profiles sp ON u.user_id = sp.user_id
        LEFT JOIN users issued_admin ON c.issued_by = issued_admin.user_id
        LEFT JOIN users verified_admin ON c.verified_by = verified_admin.user_id
        WHERE 1=1
      `;
      
      const params = [];
      let paramCount = 0;

      if (status && status !== 'all') {
        paramCount++;
        query += ` AND c.status = $${paramCount}`;
        params.push(status);
      }

      if (search) {
        paramCount++;
        query += ` AND (u.name ILIKE $${paramCount} OR u.email ILIKE $${paramCount} OR c.certificate_id ILIKE $${paramCount} OR u.student_id ILIKE $${paramCount})`;
        params.push(`%${search}%`);
      }

      query += ` ORDER BY c.created_at DESC`;

      const result = await pool.query(query, params);
      res.status(200).json({ certificates: result.rows });
    } catch (error) {
      console.error('Error fetching certificates:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const { 
        student_id,
        program_name, 
        issue_date, 
        duration, 
        domain
      } = req.body;

      console.log('Creating certificate for student:', student_id);

      // First, verify that the student exists and get their details
      const studentCheck = await pool.query(
        `SELECT u.user_id, u.name, u.email, u.student_id, sp.college, sp.branch
         FROM users u 
         LEFT JOIN student_profiles sp ON u.user_id = sp.user_id 
         WHERE u.student_id = $1 AND u.user_role = 'student'`,
        [student_id]
      );

      if (studentCheck.rows.length === 0) {
        return res.status(400).json({ 
          error: '🎓 Student not found! Please check the Student ID.' 
        });
      }

      // Check if certificate already exists for this student
      const existingCertificate = await pool.query(
        'SELECT * FROM certificates WHERE student_id = $1',
        [student_id]
      );

      if (existingCertificate.rows.length > 0) {
        return res.status(400).json({ 
          error: '📜 Certificate already exists! You can update the existing certificate instead.' 
        });
      }

      const student = studentCheck.rows[0];

      // Get admin user_id
      const adminCheck = await pool.query(
        `SELECT user_id FROM users WHERE user_role = 'admin' LIMIT 1`
      );

      if (adminCheck.rows.length === 0) {
        return res.status(400).json({ 
          error: '👨‍💼 No admin user found in the system.' 
        });
      }

      const adminUserId = adminCheck.rows[0].user_id;

      // Generate certificate ID and verification ID
      const certificateId = `Internship_Certificate_${student.student_id}`;
      const verificationId = `Verify_Internship_Certificate_${student.student_id}`;

      const query = `
        INSERT INTO certificates (
          student_id, program_name, issue_date, certificate_id, 
          verification_id, file_path, duration, domain, status,
          issued_by, student_name
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `;

      const values = [
        student_id,
        program_name,
        issue_date,
        certificateId,
        verificationId,
        '', // file_path will be updated after upload
        duration,
        domain || '',
        'issued',
        adminUserId,
        student.name
      ];

      const result = await pool.query(query, values);
      
      console.log('Certificate created successfully:', result.rows[0].id);
      console.log('Certificate ID:', certificateId);
      console.log('Verification ID:', verificationId);
      
      res.status(201).json({ 
        certificate: result.rows[0],
        message: '🎉 Certificate created successfully!'
      });
    } catch (error) {
      console.error('Error creating certificate:', error);
      
      if (error.code === '23505') { // Unique constraint violation
        res.status(400).json({ 
          error: '❌ Certificate ID already exists! Please try again.' 
        });
      } else if (error.code === '23503') {
        res.status(400).json({ 
          error: '🎓 Invalid student ID! Please check that the student exists.' 
        });
      } else {
        res.status(500).json({ error: '🚨 Internal server error' });
      }
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}