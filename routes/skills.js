import express from "express";
import {getSkills, createSkill} from "../controllers/skillControllers.js";

const skillsRouter = express.Router();

skillsRouter.get("/:id", getSkills);
skillsRouter.post("/new", createSkill);

export default skillsRouter;
