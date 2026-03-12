// pages/api/updateApplicationStatus.js
import { pool } from "../../../lib/db";

// Helper function to generate student ID
function generateStudentId(sequenceNumber) {
  const currentYear = new Date().getFullYear();
  const paddedNumber = sequenceNumber.toString().padStart(4, '0');
  return `${currentYear}ITGS${paddedNumber}`;
}

// Function to get the next sequence number for student ID
async function getNextSequence(client) {
  try {
    // Check if counters table exists
    const counterResult = await client.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'counters'
      )`
    );
    
    const countersTableExists = counterResult.rows[0].exists;
    
    if (!countersTableExists) {
      // Create counters table if it doesn't exist
      await client.query(`
        CREATE TABLE counters (
          name VARCHAR(100) PRIMARY KEY,
          value INTEGER NOT NULL DEFAULT 1
        )
      `);
      
      // Initialize student_id counter
      await client.query(`
        INSERT INTO counters (name, value) VALUES ('student_id', 1)
      `);
      
      return 1;
    }
    
    // Check if student_id counter exists
    const studentCounterResult = await client.query(
      `SELECT value FROM counters WHERE name = 'student_id' FOR UPDATE`
    );
    
    if (studentCounterResult.rows.length === 0) {
      // Initialize student_id counter if it doesn't exist
      await client.query(`
        INSERT INTO counters (name, value) VALUES ('student_id', 1)
      `);
      return 1;
    }
    
    // Get the current value
    const currentValue = studentCounterResult.rows[0].value;
    
    // Update to the next value for future use
    await client.query(`
      UPDATE counters 
      SET value = value + 1 
      WHERE name = 'student_id'
    `);
    
    return currentValue;
  } catch (error) {
    console.error("Error getting next sequence:", error);
    throw error;
  }
}

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { application_id, status, mentor } = req.body;

  if (!application_id) {
    return res.status(400).json({ error: "Application ID is required" });
  }

  try {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // First, get the application details to check current status and get user info
      const applicationQuery = await client.query(
        `SELECT a.*, u.user_id, u.email, u.name as user_name, u.student_id
         FROM applications a 
         JOIN users u ON a.user_id = u.user_id 
         WHERE a.application_id = $1`,
        [application_id]
      );

      if (applicationQuery.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: "Application not found" });
      }

      const application = applicationQuery.rows[0];
      const userId = application.user_id;
      const userEmail = application.email;
      const userName = application.user_name;
      const existingStudentId = application.student_id;

      // Build dynamic query for applications table
      const fields = [];
      const values = [];
      let idx = 1;

      if (status) {
        fields.push(`status = $${idx++}`);
        values.push(status);
      }
      if (mentor !== undefined) {
        fields.push(`mentor = $${idx++}`);
        values.push(mentor || null); // allow clearing mentor
      }

      if (fields.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: "Nothing to update" });
      }

      values.push(application_id);
      const applicationQueryStr = `
        UPDATE applications
        SET ${fields.join(", ")}
        WHERE application_id = $${idx}
        RETURNING *
      `;

      const applicationResult = await client.query(applicationQueryStr, values);
      const updatedApplication = applicationResult.rows[0];
      
      // If mentor is being assigned, update the student_profiles table too
      if (mentor) {
        // Update student_profiles table with mentor ID
        const studentProfileQuery = `
          UPDATE student_profiles 
          SET mentor = $1, updated_at = NOW()
          WHERE email = $2
          RETURNING *
        `;
        await client.query(studentProfileQuery, [mentor, userEmail]);
      }

      // If status is being updated to "accepted", generate and assign student ID
      if (status === "accepted" && application.status !== "accepted" && !existingStudentId) {
        try {
          const sequenceNumber = await getNextSequence(client);
          const newStudentId = generateStudentId(sequenceNumber);
          
          // Update the users table with the new student ID
          await client.query(
            `UPDATE users SET student_id = $1, application_status = 'accepted' WHERE user_id = $2`,
            [newStudentId, userId]
          );
          
          // Add the generated student ID to the response
          updatedApplication.new_student_id = newStudentId;
          
          console.log(`Successfully assigned student ID ${newStudentId} to user ${userId}`);
          
          // Here you could also send an acceptance email to the student
          console.log(`Would send acceptance email to ${userEmail} with student ID: ${newStudentId}`);
          
        } catch (error) {
          console.error("Error generating and assigning student ID:", error);
          // Don't fail the whole request if ID generation fails
        }
      } else if (status === "accepted" && existingStudentId) {
        // If already has a student ID, just update the status
        await client.query(
          `UPDATE users SET application_status = 'accepted' WHERE user_id = $1`,
          [userId]
        );
      }
      
      // If status is being updated from accepted to something else, handle the reversal
      if (status !== "accepted" && application.status === "accepted") {
        try {
          await client.query(
            `UPDATE users SET application_status = $1 WHERE user_id = $2`,
            [status, userId]
          );
        } catch (error) {
          console.error("Error reverting application status:", error);
        }
      }

      await client.query('COMMIT');
      res.status(200).json(updatedApplication);

    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

  } catch (err) {
    console.error("❌ Error updating application:", err);
    res.status(500).json({ error: "Failed to update application" });
  }
}