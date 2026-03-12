import { pool } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id, name } = req.query;

  // Validate input
  if (!id || !name) {
    return res.status(400).json({ 
      error: 'Student ID and Name are required' 
    });
  }

  try {
    // Query the database for the certificate with verified status
    const query = `
      SELECT 
        certificate_id,
        student_id,
        student_name,
        program_name,
        issue_date,
        duration,
        domain,
        file_path,
        verification_id,
        status,
        issued_by,
        completion_date
      FROM certificates 
      WHERE student_id = $1 
        AND LOWER(student_name) = LOWER($2)
        AND status = 'verified'
    `;

    const result = await pool.query(query, [id, name.trim()]);

    if (result.rows.length === 0) {
      // Check if a certificate exists but is not verified
      const checkExistsQuery = `
        SELECT status 
        FROM certificates 
        WHERE student_id = $1 AND LOWER(student_name) = LOWER($2)
      `;
      
      const existsResult = await pool.query(checkExistsQuery, [id, name.trim()]);
      
      if (existsResult.rows.length > 0) {
        const status = existsResult.rows[0].status;
        let message = 'No certificate found with the provided details';
        
        if (status === 'pending_verification') {
          message = 'Your certificate is pending verification. Please check back later.';
        } else if (status === 'rejected') {
          message = 'Your certificate has been rejected. Please contact support for more information.';
        }
        
        return res.status(200).json({ 
          exists: false,
          message: message,
          status: status
        });
      }
      
      return res.status(200).json({ 
        exists: false,
        message: 'No certificate found with the provided details',
        status: 'not_found'
      });
    }

    const certificate = result.rows[0];

    // Format the response data
    const certificateData = {
      certificateId: certificate.certificate_id,
      studentId: certificate.student_id,
      studentName: certificate.student_name,
      programName: certificate.program_name,
      issueDate: new Date(certificate.issue_date).toLocaleDateString('en-IN'),
      duration: certificate.duration,
      domain: certificate.domain,
      filePath: certificate.file_path,
      verificationId: certificate.verification_id,
      status: certificate.status,
      issuedBy: certificate.issued_by,
      completionDate: certificate.completion_date ? 
        new Date(certificate.completion_date).toLocaleDateString('en-IN') : null
    };

    res.status(200).json({
      exists: true,
      certificate: certificateData
    });

  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    });
  }
}