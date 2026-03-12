// pages/api/mentor/mentor-profile.js
// import { pool } from "../../../../lib/db";
import { pool } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { mentorId } = req.query;

  if (!mentorId) {
    return res.status(400).json({ message: "Mentor ID is required" });
  }

  try {
    console.log("Querying for mentor profile:", mentorId);
    
    const query = `
      SELECT 
        mp.user_id,
        mp.name,
        mp.email,
        mp.contact_no as phone,
        mp.designation,
        mp.area_of_expertise,
        mp.years_of_experience,
        mp.bio,
        mp.profile_photo,
        mp.created_at
      FROM mentor_profiles mp
      WHERE mp.user_id = $1
    `;

    const result = await pool.query(query, [mentorId]);
    
    console.log("Mentor profile query result:", result.rows.length, "mentor found");
    
    if (result.rows.length === 0) {
      // Return a default mentor object instead of 404 error
      // This prevents the frontend from breaking when no profile exists
      return res.status(200).json({ 
        mentor: {
          user_id: mentorId,
          name: "Mentor",
          designation: "Mentor",
          area_of_expertise: "",
          years_of_experience: null,
          bio: "",
          profile_photo: null
        }
      });
    }

    const mentor = result.rows[0];
    
    res.status(200).json({ 
      mentor: mentor
    });
  } catch (error) {
    console.error("Error fetching mentor profile:", error);
    res.status(200).json({ 
      mentor: {
        user_id: mentorId,
        name: "Mentor",
        designation: "Mentor",
        area_of_expertise: "",
        years_of_experience: null,
        bio: "",
        profile_photo: null
      }
    });
  }
}