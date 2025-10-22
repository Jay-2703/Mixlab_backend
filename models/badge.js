// models/badgeModel.js
import {connectToDatabase} from "../config/db.js";

export const Badge = {
  // Get all badges
  getAll: async () => {
    const [rows] = await connectToDatabase.query("SELECT * FROM badges");
    return rows;
  },

  // Get badges earned by a specific user
  getByUser: async (userId) => {
    const [rows] = await connectToDatabase.query(
      `SELECT b.* 
       FROM user_badges ub 
       JOIN badges b ON ub.badge_id = b.id 
       WHERE ub.user_id = ?`,
      [userId]
    );
    return rows;
  },

  // Add a new badge (admin use)
  create: async ({ name, description, points_required, image_url }) => {
    const [result] = await connectToDatabase.query(
      "INSERT INTO badges (name, description, points_required, image_url) VALUES (?, ?, ?, ?)",
      [name, description, points_required, image_url]
    );
    return { id: result.insertId, name, description, points_required, image_url };
  },
};
