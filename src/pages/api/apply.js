import { IncomingForm } from "formidable";
import fs from "fs";
import path from "path";
// import { pool } from "../../../lib/db.js";
import { pool } from "@/lib/db";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const getField = (field) => (Array.isArray(field) ? field[0] : field) || "";

  try {
    const uploadDir = path.join(process.cwd(), "/public/Applicants_Resume");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const form = new IncomingForm({
      uploadDir,
      keepExtensions: true,
      multiples: false,
      maxFileSize: 5 * 1024 * 1024, // 5MB limit (matching frontend)
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Form parse error:", err);
        if (err.code === "LIMIT_FILE_SIZE") {
          return res
            .status(400)
            .json({ error: "Resume size must be less than 5MB" });
        }
        return res.status(500).json({ error: "Error parsing form data" });
      }

      const email = getField(fields.email);
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      // ✅ Fetch user_id from users table
      const userResult = await pool.query(
        "SELECT user_id FROM public.users WHERE email = $1",
        [email.toLowerCase()]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: "User not found in users table" });
      }

      const userId = userResult.rows[0].user_id;

      // ✅ Fetch student profile by email
      const profileResult = await pool.query(
        `SELECT name, email, phone, college, branch, year_of_study, cgpa
         FROM public.student_profiles
         WHERE email = $1`,
        [email.toLowerCase()]
      );

      if (profileResult.rows.length === 0) {
        return res.status(404).json({ error: "Student profile not found" });
      }

      const {
        name,
        phone,
        college,
        branch,
        year_of_study,
        cgpa: dbCgpa,
      } = profileResult.rows[0];

      const contact = getField(fields.contact) || phone || "";
      const cgpa = getField(fields.cgpa) || dbCgpa;
      const durationMonths = parseInt(getField(fields.duration), 10) || null;
      const startDate = getField(fields.start_date) || null;
      const endDate = getField(fields.end_date) || null;

      // ✅ Get single interest value (not array)
      const interest = getField(fields.interest) || "";

      // ✅ Validation
      if (!contact)
        return res.status(400).json({ error: "Contact number is required" });
      if (!cgpa) return res.status(400).json({ error: "CGPA is required" });
      if (!interest)
        return res
          .status(400)
          .json({ error: "Please select an area of interest" });
      if (!durationMonths)
        return res.status(400).json({ error: "Duration is required" });

      // ✅ Validate dates if provided
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          return res
            .status(400)
            .json({ error: "Invalid start or end date" });
        }
        if (end < start) {
          return res
            .status(400)
            .json({ error: "End date cannot be before start date" });
        }
      } else if (startDate || endDate) {
        return res.status(400).json({
          error: "Both start and end dates are required if one is provided",
        });
      }

      // ✅ Check if application exists (by user_id)
      const existingApp = await pool.query(
        "SELECT application_id, resume_url FROM public.applications WHERE user_id = $1",
        [userId]
      );

      let resumeFileName = null;
      let resumePath = null;

      // ✅ Handle resume file upload
      if (files.resume) {
        const resumeFile = Array.isArray(files.resume)
          ? files.resume[0]
          : files.resume;

        if (
          resumeFile.mimetype !== "application/pdf" &&
          resumeFile.mimetype !== "application/octet-stream"
        ) {
          return res
            .status(400)
            .json({ error: "Resume must be a PDF file" });
        }

        const stats = fs.statSync(resumeFile.filepath);
        if (stats.size > 5 * 1024 * 1024) {
          fs.unlinkSync(resumeFile.filepath);
          return res
            .status(400)
            .json({ error: "Resume size must be less than 5MB" });
        }

        // ✅ Generate filename as Name_Resume.pdf
        const safeName = name.replace(/[^a-z0-9]/gi, "_");
        resumeFileName = `${safeName}_Resume.pdf`;
        resumePath = path.join(uploadDir, resumeFileName);

        // ✅ Delete existing resume file if it exists
        if (existingApp.rows.length > 0 && existingApp.rows[0].resume_url) {
          const oldFileName = path.basename(existingApp.rows[0].resume_url);
          const oldFilePath = path.join(uploadDir, oldFileName);
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        }

        // ✅ Move the new file
        if (fs.existsSync(resumePath)) fs.unlinkSync(resumePath);
        fs.renameSync(resumeFile.filepath, resumePath);
      } else if (existingApp.rows.length > 0) {
        // ✅ Keep existing resume if no new file uploaded
        resumeFileName = path.basename(existingApp.rows[0].resume_url);
      }

      if (existingApp.rows.length > 0) {
        // ✅ Update existing application
        await pool.query(
          `UPDATE public.applications
           SET contact = $1, cgpa = $2, areas_of_interest = $3, duration_months = $4,
               start_date = $5, end_date = $6, 
               resume_url = COALESCE($7, resume_url),
               updated_at = CURRENT_TIMESTAMP,
               status = 'pending'
           WHERE user_id = $8`,
          [
            contact,
            cgpa,
            interest, // Single string value now
            durationMonths,
            startDate || null,
            endDate || null,
            resumeFileName ? `/Applicants_Resume/${resumeFileName}` : null,
            userId,
          ]
        );
      } else {
        // ✅ Insert new application
        await pool.query(
          `INSERT INTO public.applications
           (user_id, email, full_name, contact, college, branch, year_of_study,
            cgpa, areas_of_interest, duration_months, start_date, end_date, resume_url, status)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'pending')`,
          [
            userId,
            email,
            name,
            contact,
            college,
            branch,
            year_of_study,
            cgpa,
            interest, // Single string value now
            durationMonths,
            startDate || null,
            endDate || null,
            resumeFileName ? `/Applicants_Resume/${resumeFileName}` : null,
          ]
        );
      }

      return res
        .status(200)
        .json({ 
          message: existingApp.rows.length > 0 
            ? "Application updated successfully!" 
            : "Application submitted successfully!",
          resumeUrl: resumeFileName ? `/Applicants_Resume/${resumeFileName}` : null
        });
    });
  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}