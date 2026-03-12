import formidable from "formidable";
import fs from "fs";
import path from "path";
import db from "./db.js";

export const config = { api: { bodyParser: false } };

// ✅ Fixed Helper function to parse and validate date from YYYY-MM-DD format
const parseDate = (dateString) => {
  // Parse the date from YYYY-MM-DD format (from input type="date")
  const parts = dateString.split('-');
  if (parts.length !== 3) {
    throw new Error("Invalid date format. Please use YYYY-MM-DD format");
  }

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // JS months are zero-based
  const day = parseInt(parts[2], 10);

  if (isNaN(day) || isNaN(month) || isNaN(year)) {
    throw new Error("Date must contain valid numbers");
  }

  // Validate date components first
  if (month < 0 || month > 11) {
    throw new Error("Invalid month. Month must be between 01 and 12.");
  }

  // Check day validity based on month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  if (day < 1 || day > daysInMonth) {
    throw new Error(`Invalid day. Day must be between 01 and ${daysInMonth} for the given month.`);
  }

  // Validate year (adjust range as needed)
  if (year < 1900 || year > new Date().getFullYear()) {
    throw new Error(`Invalid year. Year must be between 1900 and ${new Date().getFullYear()}`);
  }

  // Create and return the date object
  return new Date(year, month, day);
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const form = formidable({ multiples: false, keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parsing error:", err);
      return res.status(500).json({ error: "Form parsing failed" });
    }

    const getValue = (val) => (Array.isArray(val) ? val[0] : val);

    // Extract fields
    const userId = getValue(fields.userId);
    const name = getValue(fields.name)?.trim();
    const email = getValue(fields.email);
    const dob = getValue(fields.dob);
    const gender = getValue(fields.gender);
    const phone = getValue(fields.phone);
    const address = getValue(fields.address);
    const college = getValue(fields.college);
    const branch = getValue(fields.branch);
    const cgpa = getValue(fields.cgpa);
    const year_of_study = getValue(fields.year_of_study);
    const about = getValue(fields.about);
    const skills = getValue(fields.skills);
    const linkedin_url = getValue(fields.linkedin_url);
    const github_url = getValue(fields.github_url);

    // Validate required fields
    if (
      !userId ||
      !name ||
      !email ||
      !dob ||
      !gender ||
      !phone ||
      !address ||
      !college ||
      !branch ||
      !cgpa ||
      !year_of_study ||
      !skills ||
      !linkedin_url
    ) {
      return res.status(400).json({ error: "Required fields missing" });
    }

    // ✅ Stricter CGPA validation: 0–10 inclusive, up to 2 decimal places
    const parsedCgpa = parseFloat(cgpa);
    const cgpaPattern = /^(10(\.0{1,2})?|[0-9](\.\d{1,2})?)$/;
    if (!cgpaPattern.test(cgpa.trim())) {
      return res.status(400).json({
        error: "CGPA must be a number between 0 and 10, up to 2 decimal places",
      });
    }

    // ✅ Check Resume File
    const resumeFile =
      files.resume && files.resume[0] ? files.resume[0] : files.resume;
    if (!resumeFile || !resumeFile.filepath) {
      return res.status(400).json({ error: "Resume is required" });
    }
    if (!resumeFile.mimetype || !resumeFile.mimetype.includes("pdf")) {
      return res.status(400).json({ error: "Resume must be a PDF file" });
    }

    // ✅ DATE OF BIRTH PARSING AND VALIDATION
    let isoDob;
    try {
      // Parse the date from YYYY-MM-DD format
      const dobDateObj = parseDate(dob);
      
      // Format as YYYY-MM-DD without timezone conversion
      const year = dobDateObj.getFullYear();
      const month = String(dobDateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dobDateObj.getDate()).padStart(2, '0');
      
      isoDob = `${year}-${month}-${day}`;
      console.log("Formatted DOB for DB:", isoDob);
    } catch (parseError) {
      console.error("Date of Birth parsing error:", parseError.message);
      return res.status(400).json({ error: parseError.message });
    }

    try {
      // ✅ Ensure directories exist - UPDATED PATH
      const studentInternsDir = path.join(process.cwd(), "public", "student_interns");
      const resumeDir = path.join(studentInternsDir, "resume");
      const photoDir = path.join(studentInternsDir, "profile_photo");
      
      if (!fs.existsSync(studentInternsDir)) fs.mkdirSync(studentInternsDir, { recursive: true });
      if (!fs.existsSync(resumeDir)) fs.mkdirSync(resumeDir, { recursive: true });
      if (!fs.existsSync(photoDir)) fs.mkdirSync(photoDir, { recursive: true });

      // ✅ Save Resume - UPDATED PATH
      const resumeExt = path.extname(resumeFile.originalFilename);
      const resumeFileName = `${name.replace(/\s+/g, "_")}_resume${resumeExt}`;
      const resumeSavePath = path.join(resumeDir, resumeFileName);
      fs.renameSync(resumeFile.filepath, resumeSavePath);
      const resumePath = `/student_interns/resume/${resumeFileName}`;

      // ✅ Save Profile Photo - UPDATED PATH
      let profilePhotoPath = null;
      const photoFile =
        files.profile_photo && files.profile_photo[0]
          ? files.profile_photo[0]
          : files.profile_photo;
      if (photoFile && photoFile.filepath) {
        const photoExt = path.extname(photoFile.originalFilename);
        const photoFileName = `${name.replace(/\s+/g, "_")}_profile_photo${photoExt}`;
        const photoSavePath = path.join(photoDir, photoFileName);
        fs.renameSync(photoFile.filepath, photoSavePath);
        profilePhotoPath = `/student_interns/profile_photo/${photoFileName}`;
      }

      // ✅ Insert into database
      await db.query(
        `INSERT INTO student_profiles
         (user_id, profile_photo, name, email, dob, gender, phone, address, college, branch, cgpa, year_of_study, about, skills, linkedin_url, github_url, resume)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
        [
          userId,
          profilePhotoPath,
          name,
          email,
          isoDob,
          gender,
          phone,
          address.trim(),
          college,
          branch,
          parsedCgpa,
          year_of_study,
          about || null,
          skills,
          linkedin_url,
          github_url || null,
          resumePath,
        ]
      );

      return res
        .status(200)
        .json({ success: true, message: "Profile Created Successfully!!" });
    } catch (dbErr) {
      console.error("Database error:", dbErr);
      return res.status(500).json({ error: "Database error", details: dbErr.message });
    }
  });
}