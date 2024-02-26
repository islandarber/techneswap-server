import User from '../models/User.js';

export const getUsers = async (req, res) => { //endpoint to get all users
  try {
    const users = await User.find().populate("skills");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUser = async (req, res) => { //endpoint to get a single user
  try {
    const { id } = req.params;
    const user = await User.findById(id).populate("skills");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
