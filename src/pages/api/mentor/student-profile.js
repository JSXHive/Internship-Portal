// import { pool } from '../../../../lib/db';
import { pool } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { studentId } = req.query;

    if (!studentId) {
      return res.status(400).json({ message: 'Student ID is required' });
    }

    const result = await pool.query(`
      SELECT 
        u.user_id,
        u.student_id,
        u.name,
        u.email,
        u.created_at,
        sp.*,
        a.start_date,
        a.end_date,
        a.duration_months,
        a.areas_of_interest,
        a.resume_url as application_resume,
        a.college as application_college,
        a.branch as application_branch,
        a.year_of_study as application_year,
        a.cgpa as application_cgpa,
        a.contact as application_contact
      FROM users u
      LEFT JOIN student_profiles sp ON u.user_id = sp.user_id
      LEFT JOIN applications a ON u.user_id = a.user_id
      WHERE u.user_id = $1
    `, [studentId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student profile not found' 
      });
    }

    const studentData = result.rows[0];
    
    // Calculate internship duration in months if not available
    let durationMonths = studentData.duration_months;
    if (!durationMonths && studentData.start_date && studentData.end_date) {
      const start = new Date(studentData.start_date);
      const end = new Date(studentData.end_date);
      const diffTime = Math.abs(end - start);
      durationMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30)); // Approximate months
    }

    // Merge data from applications table if student_profiles is missing some info
    const enhancedStudentData = {
      ...studentData,
      duration_months: durationMonths,
      // Use applications data as fallback for academic info
      college: studentData.college || studentData.application_college,
      branch: studentData.branch || studentData.application_branch,
      year_of_study: studentData.year_of_study || studentData.application_year,
      cgpa: studentData.cgpa || studentData.application_cgpa,
      phone: studentData.phone || studentData.application_contact,
      // Ensure areas_of_interest is properly formatted
      areas_of_interest: Array.isArray(studentData.areas_of_interest) 
        ? studentData.areas_of_interest 
        : (studentData.areas_of_interest ? [studentData.areas_of_interest] : [])
    };

    res.status(200).json({ 
      success: true, 
      student: enhancedStudentData 
    });
  } catch (error) {
    console.error('Error fetching student profile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}