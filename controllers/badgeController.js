// controllers/badgeController.js
//import { Badge } from "../models/badgeModel.js"; -> error


export const getAllBadges = async (req, res) => {
  try {
    const badges = await Badge.getAll();
    res.json(badges);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching badges" });
  }
};

export const getUserBadges = async (req, res) => {
  try {
    const userId = req.user.id;
    const badges = await Badge.getByUser(userId);
    res.json(badges);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching user badges" });
  }
};

export const createBadge = async (req, res) => {
  try {
    const { name, description, points_required, image_url } = req.body;
    const badge = await Badge.create({ name, description, points_required, image_url });
    res.status(201).json(badge);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating badge" });
  }
};
