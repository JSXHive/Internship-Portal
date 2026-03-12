// pages/api/student/mentor-info.js
// import { pool } from '../../../../lib/db';
import { pool } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    // First, get the student's most recent application to find their assigned mentor
    const applicationsQuery = `
      SELECT mentor, application_id, status, created_at
      FROM applications 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    
    const applicationsResult = await pool.query(applicationsQuery, [userId]);
    
    if (applicationsResult.rows.length === 0) {
      return res.status(200).json({ 
        name: 'Not assigned', 
        email: 'N/A',
        status: 'no_application',
        message: 'No application found for this student'
      });
    }

    const application = applicationsResult.rows[0];
    const mentorUserId = application.mentor;

    if (!mentorUserId) {
      return res.status(200).json({ 
        name: 'Not assigned', 
        email: 'N/A',
        status: 'no_mentor',
        application_status: application.status,
        message: 'No mentor assigned to this application'
      });
    }

    // Get mentor details from mentor_profiles table
    const mentorQuery = `
      SELECT 
        mp.name,
        mp.email,
        mp.contact_no as contact,
        mp.designation,
        mp.area_of_expertise,
        mp.years_of_experience,
        mp.bio,
        mp.profile_photo,
        u.user_id
      FROM mentor_profiles mp
      JOIN users u ON mp.user_id = u.user_id
      WHERE mp.user_id = $1
    `;
    
    const mentorResult = await pool.query(mentorQuery, [mentorUserId]);

    if (mentorResult.rows.length === 0) {
      return res.status(200).json({ 
        name: 'Mentor profile not found', 
        email: 'N/A',
        status: 'profile_missing',
        mentor_user_id: mentorUserId,
        message: 'Mentor user exists but profile not found'
      });
    }

    const mentorData = mentorResult.rows[0];
    
    // Return comprehensive mentor information
    res.status(200).json({
      ...mentorData,
      status: 'assigned',
      application_status: application.status,
      application_id: application.application_id
    });

  } catch (error) {
    console.error('Error fetching mentor info:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}