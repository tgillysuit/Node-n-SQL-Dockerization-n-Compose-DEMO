// Router
import { Router } from 'express';

// User Controller
import { createUser, getUsers, createListForUser, getListsForUser } from '../controller/usersController.js' ;
// GroceryList Controller
import { getListById, addItemToList } from '../controller/listscontroller.js';
// GroceryItem Controller
import { updateItem, deleteItem } from '../controller/itemsController.js';

const router = Router();

// User routes
router.post('/users', createUser);
router.get('/users', getUsers);
router.post('/users/:userId/lists', createListForUser);
router.get('/users/:userId/lists', getListsForUser);

// GroceryList routes
router.get('/lists/:listId', getListById);
router.post('/lists/:listId/items', addItemToList);

// GroceryItem routes
router.patch('/items/:itemId', updateItem);
router.delete('/items/:itemId', deleteItem);

export default router;