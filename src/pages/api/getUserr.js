// // In pages/api/getUser.js
// import { query } from '../../../lib/db';


// export default async function handler(req, res) {
//   const { user_id } = req.query;
 
//   if (!user_id) {
//     return res.status(400).json({ error: 'User ID is required' });
//   }
 
//   try {
//     const results = await query(
//       'SELECT * FROM users WHERE user_id = ?',
//       [user_id]
//     );
   
//     if (results.length === 0) {
//       return res.status(404).json({ error: 'User not found' });
//     }
   
//     res.status(200).json(results[0]);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// }

import { pool } from "@/lib/db";

export default async function handler(req, res) {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE user_id = $1",
      [user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}