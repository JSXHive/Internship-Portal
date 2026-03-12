import { pool } from '../../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { mentorId } = req.query;

  if (!mentorId) {
    return res.status(400).json({ message: 'Mentor ID is required' });
  }

  try {
    console.log('Fetching students for mentor:', mentorId);

    const query = `
      SELECT 
        u.user_id,
        u.student_id,
        sp.name,
        sp.email,
        sp.phone,
        sp.dob,
        sp.gender,
        sp.address,
        sp.college,
        sp.branch,
        sp.year_of_study as year,
        sp.cgpa,
        sp.skills,
        sp.about,
        sp.profile_photo,
        sp.linkedin_url,
        sp.github_url,
        sp.resume,
        a.application_id,
        a.areas_of_interest,
        a.duration_months,
        a.start_date,
        a.end_date,
        a.resume_url as application_resume,
        a.created_at as application_date,
        a.status as application_status
      FROM applications a
      LEFT JOIN student_profiles sp ON a.user_id = sp.user_id
      LEFT JOIN users u ON a.user_id = u.user_id
      WHERE a.mentor = $1 AND a.status = 'accepted'
      ORDER BY a.created_at DESC
    `;

    console.log('Executing query with mentorId:', mentorId);
    const result = await pool.query(query, [mentorId]);
    console.log('Found students:', result.rows.length);

    const students = result.rows.map(row => ({
      user_id: row.user_id,
      student_id: row.student_id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      dob: row.dob,
      gender: row.gender,
      address: row.address,
      college: row.college,
      branch: row.branch,
      year: row.year,
      cgpa: row.cgpa,
      skills: row.skills,
      about: row.about,
      profile_photo: row.profile_photo,
      linkedin_url: row.linkedin_url,
      github_url: row.github_url,
      resume: row.resume,
      application_id: row.application_id,
      areas_of_interest: row.areas_of_interest,
      duration_months: row.duration_months,
      start_date: row.start_date,
      end_date: row.end_date,
      application_resume: row.application_resume,
      application_date: row.application_date,
      application_status: row.application_status
    }));

    res.status(200).json({ students });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
}