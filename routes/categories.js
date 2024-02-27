import express from 'express';
import { getCategories, createCategory } from '../controllers/categoryControllers.js';

const categoriesRouter = express.Router();

categoriesRouter.get('/', getCategories);
categoriesRouter.post('/create', createCategory);

export default categoriesRouter;