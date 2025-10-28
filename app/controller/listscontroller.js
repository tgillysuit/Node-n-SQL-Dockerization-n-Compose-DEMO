// GroceryLists Controller

import { GroceryList, User, GroceryItem } from '../database/db.js';

// GET - gets lists by id /lists/:listId
export const getListById = async (req, res) => {
    try {
        const { listId } = req.params;

        const list = await GroceryList.findByPk(listId, {
            include: [
                { model: User, as: 'user', attributes: ["id", "name"] },
                { model: GroceryItem, as: 'items' }
            ],
        });
    
        if (!list) return res.status(404).json({ error: "list not found" });

        res.json(list);
    } catch (err) {
        console.error("Error fetching list:", err);
        res.status(500).json({ error: "Failed to fetch list" });
    }
}

// POST - add item to list /lists/:listId/items
export const addItemToList = async (req, res) => {
    try {
        const { listId } = req.params;
        const { name, quantity = 1 } = req.body;

        if(!name) return res.status(400).json({ error: "name is required "});

        const list = await GroceryList.findByPk(listId);
        if (!list) return res.status(404).json({ error: "list not found" });

        const item = await GroceryItem.create({
            name,
            quantity,
            list_id: list.id
        });

        res.status(201).json(item);
    } catch (err) {
        console.error("Error adding item to list:", err);
        res.status(500).json({ error: "Failed to add item to list" });
    }
}