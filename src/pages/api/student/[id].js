// pages/api/student/[id].js
import { pool } from '../../../../lib/db';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!id) {
      return res.status(400).json({ error: 'Student ID is required' });
    }

    const client = await pool.connect();
    
    try {
      console.log('Fetching profile for student ID:', id);

      // Get student profile data
      const profileQuery = `
        SELECT 
          sp.user_id,
          sp.name,
          sp.email,
          sp.phone,
          sp.profile_photo,
          sp.dob,
          sp.gender,
          sp.address,
          sp.college,
          sp.branch,
          sp.year_of_study,
          sp.cgpa,
          sp.skills,
          sp.about,
          sp.linkedin_url,
          sp.github_url,
          sp.resume
        FROM student_profiles sp
        WHERE sp.user_id = $1
      `;

      const profileResult = await client.query(profileQuery, [id]);
      
      if (profileResult.rows.length === 0) {
        console.log('No student profile found for ID:', id);
        return res.status(404).json({ error: 'Student profile not found' });
      }

      const studentProfile = profileResult.rows[0];
      console.log('Student profile found:', studentProfile.name);

      // Get application resume if available
      let applicationResume = null;
      
      // Try to find application by user_id first
      const applicationQuery = `
        SELECT resume_url as application_resume
        FROM applications 
        WHERE user_id = $1 
        ORDER BY created_at DESC 
        LIMIT 1
      `;

      const applicationResult = await client.query(applicationQuery, [studentProfile.user_id]);
      
      if (applicationResult.rows.length > 0) {
        applicationResume = applicationResult.rows[0].application_resume;
        console.log('Found application resume');
      }

      // Format the response data
      const formattedData = {
        id: studentProfile.user_id,
        name: studentProfile.name,
        email: studentProfile.email,
        phone: studentProfile.phone,
        profile_photo: studentProfile.profile_photo,
        dob: studentProfile.dob,
        gender: studentProfile.gender,
        address: studentProfile.address,
        college: studentProfile.college,
        branch: studentProfile.branch,
        year_of_study: studentProfile.year_of_study,
        cgpa: studentProfile.cgpa,
        skills: studentProfile.skills,
        about: studentProfile.about,
        linkedin_url: studentProfile.linkedin_url,
        github_url: studentProfile.github_url,
        resume: studentProfile.resume || applicationResume
      };

      console.log('Profile data prepared for:', studentProfile.name);
      res.status(200).json(formattedData);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching student profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}