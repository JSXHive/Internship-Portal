// import { pool } from '../../../../lib/db';
import { pool } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { studentId } = req.query;

  if (!studentId) {
    return res.status(400).json({ message: 'Student ID is required' });
  }

  try {
    // Get student profile with mentor information and areas of interest
    const studentQuery = `
      SELECT 
        sp.*,
        u.student_id,
        u.email as user_email,
        a.start_date,
        a.end_date,
        a.duration_months,
        a.areas_of_interest,
        a.mentor as assigned_mentor_id,
        mp.name as mentor_name,
        mp.email as mentor_email,
        mp.contact_no as mentor_contact,
        mp.designation as mentor_designation,
        mp.area_of_expertise as mentor_expertise,
        mp.years_of_experience as mentor_experience,
        mp.profile_photo as mentor_photo,
        mp.bio as mentor_bio
      FROM student_profiles sp
      LEFT JOIN users u ON sp.user_id = u.user_id
      LEFT JOIN applications a ON u.user_id = a.user_id
      LEFT JOIN mentor_profiles mp ON a.mentor = mp.user_id
      WHERE sp.user_id = $1 OR u.student_id = $1
    `;

    const client = await pool.connect();
    try {
      const studentResult = await client.query(studentQuery, [studentId]);
      
      if (studentResult.rows.length === 0) {
        return res.status(404).json({ message: 'Student not found' });
      }

      const studentData = studentResult.rows[0];

      // Format the response
      const student = {
        user_id: studentData.user_id,
        student_id: studentData.student_id,
        name: studentData.name,
        email: studentData.user_email || studentData.email,
        profile_photo: studentData.profile_photo,
        phone: studentData.phone,
        dob: studentData.dob,
        gender: studentData.gender,
        college: studentData.college,
        branch: studentData.branch,
        cgpa: studentData.cgpa,
        year_of_study: studentData.year_of_study,
        about: studentData.about,
        skills: studentData.skills,
        areas_of_interest: studentData.areas_of_interest, // Added this field
        linkedin_url: studentData.linkedin_url,
        github_url: studentData.github_url,
        resume: studentData.resume,
        application_resume: studentData.resume_url,
        address: studentData.address,
        start_date: studentData.start_date,
        end_date: studentData.end_date,
        duration_months: studentData.duration_months,
        mentor: studentData.assigned_mentor_id ? {
          mentor_id: studentData.assigned_mentor_id,
          name: studentData.mentor_name,
          email: studentData.mentor_email,
          contact_no: studentData.mentor_contact,
          designation: studentData.mentor_designation,
          area_of_expertise: studentData.mentor_expertise,
          years_of_experience: studentData.mentor_experience,
          profile_photo: studentData.mentor_photo,
          bio: studentData.mentor_bio
        } : null
      };

      res.status(200).json({ student });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching student profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}