import express from 'express';
import {getUsers, getUser, getUserById, createUser, updateUser, loginUser} from '../controllers/userControllers.js';
import {upload} from '../middleware/forImgupload.js';
import { authMiddleware } from '../middleware/userAuth.js';

const usersRouter = express.Router();

usersRouter.get('/',authMiddleware, getUsers);
usersRouter.get('/user',authMiddleware, getUser);
usersRouter.get('/:id',authMiddleware, getUserById);
usersRouter.post('/register', createUser);
usersRouter.put('/update',authMiddleware, upload.single('img'), updateUser);
usersRouter.post('/login', loginUser);




export default usersRouter;