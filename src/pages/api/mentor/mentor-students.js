import { pool } from '../../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { mentorId } = req.query;

    if (!mentorId) {
      return res.status(400).json({ message: 'Mentor ID is required' });
    }

    // Get students assigned to this mentor with their student IDs and internship dates
    const result = await pool.query(`
      SELECT 
        u.user_id,
        u.student_id,
        u.name,
        u.email,
        u.application_status,
        sp.profile_photo,
        sp.college,
        sp.branch,
        sp.year_of_study,
        sp.phone,
        sp.skills,
        a.areas_of_interest,  -- Changed from sp.areas_of_interest to a.areas_of_interest
        a.start_date,
        a.end_date,
        a.duration_months,
        a.resume_url,
        msa.assigned_date as mentor_assigned_date
      FROM users u
      LEFT JOIN student_profiles sp ON u.user_id = sp.user_id
      LEFT JOIN applications a ON u.user_id = a.user_id
      INNER JOIN mentor_student_assignments msa ON u.user_id = msa.student_id
      WHERE msa.mentor_id = $1 AND u.user_role = 'student'
      ORDER BY u.name
    `, [mentorId]);

    // Enhance student data with calculated duration if needed
    const enhancedStudents = result.rows.map(student => {
      let durationMonths = student.duration_months;
      
      // Calculate duration if not available but dates are present
      if (!durationMonths && student.start_date && student.end_date) {
        const start = new Date(student.start_date);
        const end = new Date(student.end_date);
        const diffTime = Math.abs(end - start);
        durationMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30)); // Approximate months
      }

      return {
        ...student,
        duration_months: durationMonths,
        // Ensure areas_of_interest is properly formatted
        areas_of_interest: Array.isArray(student.areas_of_interest) 
          ? student.areas_of_interest 
          : (student.areas_of_interest ? [student.areas_of_interest] : [])
      };
    });

    res.status(200).json({ 
      success: true, 
      students: enhancedStudents 
    });
  } catch (error) {
    console.error('Error fetching mentor students:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}