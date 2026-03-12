import db from "../db.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  
  const { userId } = req.query;
  
  try {
    if (userId) {
      // Get specific mentor profile with student count
      const result = await db.query(
        `SELECT 
          mp.*,
          COUNT(sp.user_id) AS assigned_students
         FROM mentor_profiles mp
         LEFT JOIN student_profiles sp ON mp.user_id = sp.mentor
         WHERE mp.user_id = $1
         GROUP BY mp.id, mp.user_id, mp.name, mp.email, mp.contact_no, 
                  mp.designation, mp.area_of_expertise, mp.years_of_experience, 
                  mp.bio, mp.profile_photo, mp.created_at, mp.updated_at`,
        [userId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Profile not found" });
      }

      // Process the profile data to ensure proper file paths
      const profile = result.rows[0];
      
      // Update profile_photo path to use the correct directory
      if (profile.profile_photo) {
        // Extract just the filename from the path
        const fileName = profile.profile_photo.split('/').pop();
        // Set the correct path for mentor profile photos
        profile.profile_photo = `/mentor/profile_photo/${fileName}`;
      }
      
      return res.status(200).json({ profile });
    } else {
      // Get all mentors with student counts
      const result = await db.query(
        `SELECT 
          mp.*,
          COUNT(sp.user_id) AS assigned_students
         FROM mentor_profiles mp
         LEFT JOIN student_profiles sp ON mp.user_id = sp.mentor
         GROUP BY mp.id, mp.user_id, mp.name, mp.email, mp.contact_no, 
                  mp.designation, mp.area_of_expertise, mp.years_of_experience, 
                  mp.bio, mp.profile_photo, mp.created_at, mp.updated_at
         ORDER BY mp.name`
      );

      // Process all mentor profiles to ensure proper file paths
      const mentors = result.rows.map(mentor => {
        if (mentor.profile_photo) {
          // Extract just the filename from the path
          const fileName = mentor.profile_photo.split('/').pop();
          // Set the correct path for mentor profile photos
          mentor.profile_photo = `/mentor/profile_photo/${fileName}`;
        }
        return mentor;
      });
      
      return res.status(200).json({ mentors });
    }
  } catch (err) {
    console.error("Mentor profile fetch error:", err);
    return res.status(500).json({ error: "Database error" });
  }
}