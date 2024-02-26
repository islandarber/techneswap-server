import express from "express";
import {getSkills, createSkill} from "../controllers/skillControllers.js";

const skillsRouter = express.Router();

skillsRouter.get("/", getSkills);
skillsRouter.post("/new", createSkill);

export default skillsRouter;
