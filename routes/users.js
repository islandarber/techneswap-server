import express from 'express';
import {getUsers, getUser, createUser, updateUser, loginUser} from '../controllers/userControllers.js';

const usersRouter = express.Router();

usersRouter.get('/', getUsers);
usersRouter.get('/:id', getUser);
usersRouter.post('/register', createUser);
usersRouter.put('/update/:id', updateUser);
usersRouter.post('/login', loginUser);




export default usersRouter;