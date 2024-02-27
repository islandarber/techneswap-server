import Skill from "../models/Skill.js";

export const getSkills = async (req, res) => {
  const category = req.params.id;
  try {
    const skills = await Skill.find({category}).populate('category');
    res.json(skills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createSkill = async (req, res) => {
  const {name, category} = req.body;
  try {
    const newSkill = await Skill.create({name, category});
    await newSkill.populate('category');
    res.status(201).json(newSkill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}



