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

export const createUser = async (req, res) => {
  const {firstName, lastName, email, password} = req.body;
  try {
    const user = await User.create({firstName, lastName, email, password});
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}//endpoint to create a user

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const {firstName, lastName, email, location, skills, needs, visibility} = req.body;
  try {
    const user = await User.findByIdAndUpdate({_id: id}, {firstName, lastName, email, location, skills, needs, visibility}, {new: true});
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}//endpoint to update a user


export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (!user) {
      res.status(404).json({ message: "User not found" });
    }
    if (user.password !== password) {
      res.status(401).json({ message: "Invalid credentials" });
    }

    res.status(200).json(user);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}//endpoint to login a user


