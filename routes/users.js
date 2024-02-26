import express from 'express';
import {getUsers, getUser, createUser} from '../controllers/userControllers.js';

const usersRouter = express.Router();

usersRouter.get('/all', getUsers);
usersRouter.get('/:id', getUser);
usersRouter.post('/create', createUser);




export default usersRouter;