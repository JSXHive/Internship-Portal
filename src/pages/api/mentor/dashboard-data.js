import { pool } from '../../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { mentorId } = req.query;

  if (!mentorId) {
    return res.status(400).json({ error: 'Mentor ID is required' });
  }

  let client;
  try {
    client = await pool.connect();
    
    console.log('🔍 Fetching dashboard data for mentor:', mentorId);

    // STEP 1: Get all students assigned to this mentor from applications table
    console.log('📊 Step 1: Fetching students...');
    const studentsQuery = `
      SELECT 
        u.student_id,
        u.user_id,
        u.name as student_name,
        u.email,
        u.application_status,
        a.college,
        a.branch,
        a.year_of_study,
        a.application_id,
        a.status as application_status,
        a.start_date,
        a.end_date,
        sp.profile_photo,
        sp.phone,
        sp.skills
      FROM applications a
      INNER JOIN users u ON a.user_id = u.user_id
      LEFT JOIN student_profiles sp ON u.user_id = sp.user_id
      WHERE a.mentor = $1 AND a.status IN ('accepted', 'completed')
      ORDER BY u.name
    `;
    
    const studentsResult = await client.query(studentsQuery, [mentorId]);
    const students = studentsResult.rows;
    
    console.log('✅ Found students:', students.length);

    if (students.length === 0) {
      console.log('ℹ️ No students found for this mentor');
      
      return res.status(200).json({
        students: [],
        tasks: [],
        deliverables: [],
        certificates: [],
        attendance: [],
        message: 'No students assigned to this mentor'
      });
    }

    const studentUserIds = students.map(s => s.user_id);
    const studentIds = students.map(s => s.student_id).filter(id => id);

    console.log('📋 Student User IDs:', studentUserIds);
    console.log('📋 Student IDs:', studentIds);

    // STEP 3: Get tasks for these students
    let tasks = [];
    try {
      console.log('📊 Step 3: Fetching tasks...');
      const tasksQuery = `
        SELECT 
          t.*, 
          ts.submission_id, 
          ts.submission_date, 
          ts.file_paths, 
          ts.remarks, 
          ts.status as submission_status, 
          ts.marks, 
          ts.mentor_feedback,
          ts.reviewed_by,
          ts.feedback_date,
          u.name as student_name, 
          u.student_id
        FROM student_tasks t
        LEFT JOIN task_submissions ts ON t.task_id = ts.task_id
        INNER JOIN users u ON t.assigned_to = u.user_id
        WHERE t.assigned_to = ANY($1)
        ORDER BY t.due_date DESC
      `;
      
      const tasksResult = await client.query(tasksQuery, [studentUserIds]);
      tasks = tasksResult.rows;
      console.log('✅ Found tasks:', tasks.length);
    } catch (tasksError) {
      console.error('❌ Error fetching tasks:', tasksError.message);
      tasks = [];
    }

    // STEP 4: Get deliverables for these students
    let deliverables = [];
    try {
      console.log('📊 Step 4: Fetching deliverables...');
      const deliverablesQuery = `
        SELECT 
          d.*, 
          u.name as student_name, 
          u.student_id
        FROM deliverables d
        INNER JOIN users u ON d.user_id = u.user_id
        WHERE d.user_id = ANY($1)
        ORDER BY d.submission_date DESC
      `;
      
      const deliverablesResult = await client.query(deliverablesQuery, [studentUserIds]);
      deliverables = deliverablesResult.rows;
      console.log('✅ Found deliverables:', deliverables.length);
    } catch (deliverablesError) {
      console.error('❌ Error fetching deliverables:', deliverablesError.message);
      deliverables = [];
    }

    // STEP 5: Get certificates for these students - INCLUDING PENDING VERIFICATION
    let certificates = [];
    try {
      console.log('📊 Step 5: Fetching certificates...');
      const certificatesQuery = `
        SELECT 
          c.*, 
          u.name as student_name, 
          u.student_id,
          u.email as student_email
        FROM certificates c
        INNER JOIN users u ON c.student_id = u.student_id
        WHERE c.student_id = ANY($1)
        ORDER BY c.issue_date DESC
      `;
      
      const certificatesResult = await client.query(certificatesQuery, [studentIds]);
      certificates = certificatesResult.rows;
      console.log('✅ Found certificates:', certificates.length);
    } catch (certificatesError) {
      console.error('❌ Error fetching certificates:', certificatesError.message);
      certificates = [];
    }

    // STEP 6: Get attendance for these students
    let attendance = [];
    try {
      console.log('📊 Step 6: Fetching attendance...');
      const attendanceQuery = `
        SELECT 
          a.*, 
          u.name as student_name, 
          u.student_id
        FROM attendance a
        INNER JOIN users u ON a.student_id = u.student_id
        WHERE a.student_id = ANY($1)
        ORDER BY a.date DESC
      `;
      
      const attendanceResult = await client.query(attendanceQuery, [studentIds]);
      attendance = attendanceResult.rows;
      console.log('✅ Found attendance records:', attendance.length);
    } catch (attendanceError) {
      console.log('ℹ️ Attendance table might not exist or have different structure:', attendanceError.message);
      attendance = [];
    }

    // Final response
    console.log('🎉 Dashboard data fetch completed successfully');
    res.status(200).json({
      students,
      tasks,
      deliverables,
      certificates,
      attendance,
      message: 'Dashboard data loaded successfully'
    });

  } catch (error) {
    console.error('💥 Dashboard data error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch dashboard data',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    if (client) {
      client.release();
    }
  }
}