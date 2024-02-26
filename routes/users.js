import express from 'express';
import {getUsers, getUser, createUser, updateUser} from '../controllers/userControllers.js';

const usersRouter = express.Router();

usersRouter.get('/all', getUsers);
usersRouter.get('/:id', getUser);
usersRouter.post('/create', createUser);
usersRouter.put('/update/:id', updateUser);



export default usersRouter;