// pages/api/student/get-application.js
// import { pool } from '../../../../lib/db';
import { pool } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userId } = req.query;

  console.log('Fetching application for user:', userId);

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    // Get the latest application data for the user WITH student_id from users table
    const applicationQuery = `
      SELECT 
        a.application_id,
        a.user_id,
        a.full_name,
        a.email,
        a.contact as phone,
        a.college,
        a.branch,
        a.year_of_study,
        a.duration_months,
        a.start_date,
        a.end_date,
        a.resume_url,
        a.status,
        a.mentor,
        a.created_at,
        a.updated_at,
        u.student_id  -- ADD THIS LINE to get student_id from users table
      FROM applications a
      LEFT JOIN users u ON a.user_id = u.user_id  -- ADD THIS JOIN
      WHERE a.user_id = $1 
      ORDER BY a.created_at DESC 
      LIMIT 1
    `;

    console.log('Executing query for user:', userId);
    const applicationResult = await pool.query(applicationQuery, [userId]);
    
    console.log('Query result:', {
      rowCount: applicationResult.rows.length,
      rows: applicationResult.rows
    });
    
    if (applicationResult.rows.length === 0) {
      console.log('No application found for user:', userId);
      return res.status(404).json({ 
        message: 'No application found for this user',
        hasApplication: false,
        userId: userId
      });
    }

    const applicationData = applicationResult.rows[0];
    console.log('Application data found:', applicationData);

    // Format the response to match what your component expects
    const studentInfo = {
      full_name: applicationData.full_name,
      email: applicationData.email,
      student_id: applicationData.student_id, // CHANGED: Use actual student_id from users table
      college: applicationData.college || 'Not specified',
      branch: applicationData.branch || 'Not specified',
      year_of_study: applicationData.year_of_study || 'Not specified',
      phone: applicationData.phone || 'Not specified',
      start_date: applicationData.start_date,
      end_date: applicationData.end_date,
      mentor: applicationData.mentor,
      application_status: applicationData.status,
      hasApplication: true,
      duration_months: applicationData.duration_months
    };

    console.log('Sending response with student_id:', studentInfo.student_id);
    res.status(200).json(studentInfo);
  } catch (error) {
    console.error('Error fetching student application:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message,
      userId: userId
    });
  }
}