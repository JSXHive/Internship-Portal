import { pool } from "../../../lib/db";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: "Missing email" });
  }

  try {
    const normalizedEmail = email.toLowerCase();

    // First get the student profile
    const result = await pool.query(
      "SELECT * FROM student_profiles WHERE email = $1",
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const student = result.rows[0];

    // Then get the application data to get the interest
    const userResult = await pool.query(
      "SELECT user_id FROM public.users WHERE email = $1",
      [normalizedEmail]
    );

    let interest = '';
    if (userResult.rows.length > 0) {
      const userId = userResult.rows[0].user_id;
      const appResult = await pool.query(
        "SELECT areas_of_interest FROM public.applications WHERE user_id = $1",
        [userId]
      );
      
      if (appResult.rows.length > 0) {
        interest = appResult.rows[0].areas_of_interest || '';
      }
    }

    const profileData = {
      profilePhoto: student.profile_photo,
      name: student.name,
      email: student.email,
      dateOfBirth: student.dob,
      gender: student.gender,
      phone: student.phone,
      address: student.address,
      college: student.college,
      branch: student.branch,
      cgpa: student.cgpa,
      yearOfStudy: student.year_of_study,
      about: student.about,
      skills: student.skills,
      linkedin: student.linkedin_url,
      github: student.github_url,
      resume: student.resume,
      interest: interest, // Single string value
    };

    return res.status(200).json(profileData);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}