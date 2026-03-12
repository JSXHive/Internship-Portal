import db from "./db.js";
import formidable from "formidable";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper function to safely delete files
const safeDeleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error(`Error deleting file ${filePath}:`, error);
  }
};

// IMPROVED function to delete ALL old files for a user (regardless of extension)
const deleteAllUserProfilePhotos = (dir, userId, userName) => {
  try {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      const sanitizedName = userName.replace(/[^a-zA-Z0-9]/g, "_");
      
      console.log(`Looking for files to delete for user ${userId} in ${dir}`);
      console.log(`Files in directory:`, files);
      
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const fileName = path.parse(file).name;
        
        // Check if file matches either pattern:
        // 1. Current naming pattern: {sanitizedName}_{userId}_profile
        // 2. Any file that contains the userId (to catch old files)
        if (fileName.startsWith(`${sanitizedName}_${userId}_profile`) || 
            fileName.includes(userId)) {
          console.log(`Deleting old profile photo: ${filePath}`);
          safeDeleteFile(filePath);
        }
      });
    }
  } catch (error) {
    console.error(`Error deleting old files in ${dir}:`, error);
  }
};

// Function to get file extension from mime type as fallback
const getExtensionFromMime = (mimeType, originalFilename) => {
  // First try to get extension from original filename
  const extFromName = path.extname(originalFilename);
  if (extFromName) return extFromName;
  
  // Fallback to mime type mapping
  const mimeToExt = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
  };
  
  return mimeToExt[mimeType] || '.jpg'; // Default to jpg
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // Create directories if they don't exist - use consistent path
    const profilePhotoDir = path.join(process.cwd(), "public", "mentor", "profile_photo");
    const tmpDir = path.join(process.cwd(), "public", "tmp");
    
    [profilePhotoDir, tmpDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    const form = formidable({
      uploadDir: tmpDir,
      keepExtensions: true,
      maxFileSize: 1 * 1024 * 1024, // STRICT 1MB limit
      maxFieldsSize: 2 * 1024 * 1024, // 2MB for all fields
      maxTotalFileSize: 1 * 1024 * 1024, // 1MB for all files
    });

    const [fields, files] = await form.parse(req);

    // Extract fields from form data
    const userId = fields.userId?.[0];
    
    if (!userId) {
      return res.status(400).json({ error: "Missing user ID" });
    }

    // First get the current profile to preserve existing file paths if not updated
    const currentProfile = await db.query(
      `SELECT profile_photo, name FROM mentor_profiles WHERE user_id = $1`,
      [userId]
    );

    let profilePhotoPath = null;
    const userName = fields.name?.[0] || (currentProfile.rows[0]?.name || 'mentor');

    // Handle file uploads - only if a new file is provided
    if (files.profile_photo && files.profile_photo[0]) {
      const profilePhoto = files.profile_photo[0];
      
      // Additional server-side validation for file size (1MB)
      if (profilePhoto.size > 1 * 1024 * 1024) {
        // Clean up the temporary file
        safeDeleteFile(profilePhoto.filepath);
        return res.status(413).json({ 
          error: "File too large", 
          details: "Profile photo must be 1MB or smaller" 
        });
      }
      
      // Validate file type
      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(profilePhoto.mimetype)) {
        safeDeleteFile(profilePhoto.filepath);
        return res.status(400).json({ 
          error: "Invalid file type", 
          details: "Only JPG and PNG images are allowed" 
        });
      }

      // Get file extension with fallback
      let photoExt = path.extname(profilePhoto.originalFilename);
      if (!photoExt) {
        photoExt = getExtensionFromMime(profilePhoto.mimetype, profilePhoto.originalFilename);
      }
      
      const sanitizedName = userName.replace(/[^a-zA-Z0-9]/g, "_");
      const photoFileName = `${sanitizedName}_${userId}_profile${photoExt}`;
      const newPath = path.join(profilePhotoDir, photoFileName);
      
      // DELETE ALL existing profile photos for this user BEFORE saving new one
      console.log(`Deleting all old profile photos for user ${userId}`);
      deleteAllUserProfilePhotos(profilePhotoDir, userId, userName);

      try {
        // Read the temporary file and write to destination
        const fileData = fs.readFileSync(profilePhoto.filepath);
        fs.writeFileSync(newPath, fileData);
        
        // Use consistent path that matches GET API
        profilePhotoPath = `/mentor/profile_photo/${photoFileName}`;
        console.log(`Profile photo saved as: ${photoFileName} (${profilePhoto.size} bytes)`);
        console.log(`New profile path: ${profilePhotoPath}`);
      } catch (error) {
        console.error("Error processing profile photo:", error);
        // Clean up temporary file
        safeDeleteFile(profilePhoto.filepath);
        return res.status(500).json({ error: "Error processing profile photo" });
      } finally {
        // Always delete the temporary file
        safeDeleteFile(profilePhoto.filepath);
      }
    } else if (currentProfile.rows.length > 0) {
      // Keep existing profile photo if no new file uploaded
      profilePhotoPath = currentProfile.rows[0].profile_photo;
      console.log(`No new photo uploaded, keeping existing: ${profilePhotoPath}`);
    }

    // Extract other fields
    const name = fields.name?.[0] || null;
    const email = fields.email?.[0] || null;
    const contact_no = fields.contact_no?.[0] || null;
    const designation = fields.designation?.[0] || null;
    const area_of_expertise = fields.area_of_expertise?.[0] || null;
    const years_of_experience = fields.years_of_experience?.[0] || null;

    // Check if profile already exists
    const existingProfile = await db.query(
      `SELECT * FROM mentor_profiles WHERE user_id = $1`,
      [userId]
    );

    let result;
    
    if (existingProfile.rows.length > 0) {
      // Update existing profile
      const query = `
        UPDATE mentor_profiles 
        SET name = $1, email = $2, contact_no = $3, designation = $4, 
            area_of_expertise = $5, years_of_experience = $6, 
            profile_photo = $7, updated_at = NOW()
        WHERE user_id = $8
        RETURNING *
      `;

      const params = [
        name,
        email,
        contact_no,
        designation,
        area_of_experience,
        years_of_experience,
        profilePhotoPath,
        userId
      ];

      result = await db.query(query, params);
    } else {
      // Create new profile
      const query = `
        INSERT INTO mentor_profiles 
        (user_id, name, email, contact_no, designation, area_of_expertise, years_of_experience, profile_photo)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;

      const params = [
        userId,
        name,
        email,
        contact_no,
        designation,
        area_of_expertise,
        years_of_experience,
        profilePhotoPath
      ];

      result = await db.query(query, params);
    }

    if (result.rows.length === 0) {
      return res.status(500).json({ error: "Profile save failed" });
    }

    return res.status(200).json({ 
      success: true, 
      profile: result.rows[0],
      profilePhotoPath: profilePhotoPath
    });
  } catch (err) {
    console.error("Error saving mentor profile:", err);
    
    // Handle file size errors specifically
    if (err.code === 1009) {
      return res.status(413).json({ 
        error: "File too large", 
        details: "Profile photo must be 1MB or smaller" 
      });
    }
    
    return res.status(500).json({ error: "Database error", details: err.message });
  }
}