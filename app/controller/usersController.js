// Users Controller
import chalk from 'chalk';
import { User, GroceryLists } from '../database/db.js';

// POST - creating user
export const createUser = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: "name required!" });

        const user =  await User.create({ name });
        res.status(201).json(user);
    } catch (err) {
        console.log(chalk.red("Error creating user: ", err))
        res.status(500).json({ error: "Failed to create user "});
    }
}

// GET - get users
export const getUsers = async (req, res) => {
    try {
        const users = await User.findAll({ order: [["id", "ASC" ]] });
        res.json(users);
    } catch (err) {
        console.log(chalk.red("Error fetching users: ", err))
    }
}
