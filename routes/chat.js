import express from "express";
import { getChats, createChat } from "../controllers/chatControllers.js";

const chatRouter = express.Router();

chatRouter.get("/", getChats);
chatRouter.post("/", createChat);

export default chatRouter;
