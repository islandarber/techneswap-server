import express from 'express';
import {getUsers, getUser, createUser, updateUser, loginUser} from '../controllers/userControllers.js';
import {upload} from '../middleware/forImgupload.js';

const usersRouter = express.Router();

usersRouter.get('/', getUsers);
usersRouter.get('/:id', getUser);
usersRouter.post('/register', createUser);
usersRouter.put('/update/:id',upload.single('img'), updateUser);
usersRouter.post('/login', loginUser);




export default usersRouter;