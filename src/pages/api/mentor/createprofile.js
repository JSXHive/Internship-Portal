import formidable from "formidable";
import fs from "fs";
import path from "path";
import db from "../db.js";

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  
  const form = formidable({ 
    multiples: false, 
    keepExtensions: true,
    maxFileSize: 1 * 1024 * 1024 // 1MB limit
  });
  
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parsing error:", err);
      return res.status(500).json({ error: "Form parsing failed" });
    }
    
    const getValue = (val) => (Array.isArray(val) ? val[0] : val);
    const userId = getValue(fields.userId);
    const name = getValue(fields.name)?.trim();
    const email = getValue(fields.email);
    const contact_no = getValue(fields.contact_no);
    const designation = getValue(fields.designation);
    const area_of_expertise = getValue(fields.area_of_expertise);
    const years_of_experience = getValue(fields.years_of_experience);
    const bio = getValue(fields.bio);

    if (!userId || !name || !email || !contact_no || !designation || !area_of_expertise || !years_of_experience) {
      return res.status(400).json({ error: "Required fields missing" });
    }

    // Save profile photo if provided
    let profilePhotoPath = null;
    const photoFile = files.profile_photo && files.profile_photo[0] ? files.profile_photo[0] : files.profile_photo;
    
    if (photoFile && photoFile.filepath) {
      try {
        // Create the mentor/profile_photo directory structure
        const photoDir = path.join(process.cwd(), "public", "mentor", "profile_photo");
        if (!fs.existsSync(photoDir)) {
          fs.mkdirSync(photoDir, { recursive: true });
        }
        
        // Generate filename with exact format: Name_profile_photo.extension
        const photoExt = path.extname(photoFile.originalFilename);
        const sanitizedName = name.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "");
        const photoFileName = `${sanitizedName}_profile_photo${photoExt}`;
        const photoSavePath = path.join(photoDir, photoFileName);
        
        // Move the file to the destination directory (will overwrite if exists)
        fs.renameSync(photoFile.filepath, photoSavePath);
        profilePhotoPath = `/mentor/profile_photo/${photoFileName}`;
      } catch (fileError) {
        console.error("Error saving profile photo:", fileError);
        return res.status(500).json({ error: "Failed to save profile photo" });
      }
    }

    try {
      await db.query(
        `INSERT INTO mentor_profiles
         (user_id, name, email, contact_no, designation, area_of_expertise, years_of_experience, bio, profile_photo)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (user_id) DO UPDATE SET
           name = EXCLUDED.name,
           email = EXCLUDED.email,
           contact_no = EXCLUDED.contact_no,
           designation = EXCLUDED.designation,
           area_of_expertise = EXCLUDED.area_of_expertise,
           years_of_experience = EXCLUDED.years_of_experience,
           bio = EXCLUDED.bio,
           profile_photo = EXCLUDED.profile_photo`,
        [
          userId,
          name,
          email,
          contact_no,
          designation,
          area_of_expertise,
          years_of_experience,
          bio || null,
          profilePhotoPath,
        ]
      );
      return res.status(200).json({ success: true, message: "Mentor Profile Saved Successfully!" });
    } catch (dbErr) {
      console.error("Database error:", dbErr);
      return res.status(500).json({ error: "Database error", details: dbErr.message });
    }
  });
}