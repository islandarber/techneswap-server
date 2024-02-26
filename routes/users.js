import express from 'express';
import {getUsers} from '../controllers/userControllers.js';

const usersRouter = express.Router();

usersRouter.get('/all', getUsers);

export default usersRouter;