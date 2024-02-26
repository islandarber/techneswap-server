import express from "express";
import {getSkills} from "../controllers/skillControllers.js";

const skillsRouter = express.Router();

skillsRouter.get("/", getSkills);

export default skillsRouter;
