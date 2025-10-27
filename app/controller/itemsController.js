// GroceryItems controller
import { GroceryItem } from "../database/db.js";

// PATCH - update grocery item /items/:itemId
export const updateItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const { checked, quantity, name } = req.body;

        const item = await GroceryItem.findByPk(itemId);
        if (!item) return res.status(404).json({ error: "item not found" });

        if (checked !== undefined) GroceryItem.checked = !!checked;
        if (quantity !== undefined) GroceryItem.quantity = Number(quantity);
        if (name !== undefined) GroceryItem.name = name;

        await item.save();
        res.json(item);
    } catch (err) {
        console.error("Error updating item:", err);
        res.status(500).json({ error: "Failed to update item" });
    }
}

// DELETE - delete item from list /items/:itemId
export const deleteItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const deleteItem = await GroceryItem.destroy({ where: { id: itemId }});

        if (!deleteItem) return res.status(404).json({ error: "not found" });

        res.status(204).end();
    } catch (err) {
        console.error("Error deleting item:", err);
        res.status(500).json({ error: "Failed to delete item" });
    }
}