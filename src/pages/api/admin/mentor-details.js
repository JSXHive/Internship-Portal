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
    const mentorQuery = `
      SELECT 
        mp.user_id as mentor_id,
        mp.name,
        mp.email,
        mp.contact_no,
        mp.designation,
        mp.area_of_expertise,
        mp.years_of_experience,
        mp.profile_photo,
        mp.bio
      FROM mentor_profiles mp
      WHERE mp.user_id = $1
    `;

    const client = await pool.connect();
    try {
      const mentorResult = await client.query(mentorQuery, [mentorId]);
      
      if (mentorResult.rows.length === 0) {
        return res.status(404).json({ message: 'Mentor not found' });
      }

      const mentorData = mentorResult.rows[0];

      // Format the response
      const mentor = {
        mentor_id: mentorData.mentor_id,
        name: mentorData.name,
        email: mentorData.email,
        contact_no: mentorData.contact_no,
        designation: mentorData.designation,
        area_of_expertise: mentorData.area_of_expertise,
        years_of_experience: mentorData.years_of_experience,
        profile_photo: mentorData.profile_photo,
        bio: mentorData.bio
      };

      res.status(200).json({ mentor });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching mentor details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}