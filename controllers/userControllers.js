import User from '../models/User.js';

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().populate("skills");
    res.json(users);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};