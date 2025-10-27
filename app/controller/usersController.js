// Users Controller

import { User, GroceryList } from '../database/db.js';

// POST - creating user = /users
export const createUser = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: "name required!" });

        const user =  await User.create({ name });
        res.status(201).json(user);
    } catch (err) {
        console.error("Error creating user: ", err);
        res.status(500).json({ error: "Failed to create user "});
    }
}

// GET - get users = /users
export const getUsers = async (req, res) => {
    try {
        const users = await User.findAll({ order: [["id", "ASC" ]] });
        res.json(users);
    } catch (err) {
        console.error("Error fetching users: ", err);
    }
}

// POST - creating grocery list for user /users/:userId/lists
export const createListForUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { title } = req.body; // title represents the name of grocery list that belongs to the specific user

        if(!title) return res.status(400).json({ error: "title is required "});

        const user = await User.findByPk(userId);
        if(!user) return res.status(404).json({ error: "user not found" });

        const list = await GroceryList.create({ 
            title, 
            user_id: 
            user.id
        });
        
        res.status(201).json(list);
    } catch (err) {
        console.error("Error creating list for user: ", err);
        res.status(500).json({ error: "Failed to create list for user "});
    }
}

// GET - gets all grocery lists from that user /users/:userId/lists?includeItems=1
export const getListsForUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const includeItems = req.query.includeItems === '1';

        const user = await User.findByPk(userId);
        if(!user) return res.status(404).json({ error: "user not found" });

        const lists = await GroceryList.findAll({
            where: { user_id: user.id },
            include: includeItems ? [{ association: "items" }] : [],
            order: [["id", "ASC"]]
        });

        res.json(lists);
    } catch (err) {
        console.error("Error fetching user lists:", err);
        res.status(500).json({ error: "Failed to fetch lists "});
    }
}