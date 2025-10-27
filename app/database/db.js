import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';
import chalk from 'chalk'

dotenv.config();

const {
    DB_HOST,
    DB_USER,
    DB_PASSWORD,
    DB_NAME,
    DB_PORT,
} = process.env;

// Sequelize instance for MySQL
export const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    port: DB_PORT,
    dialect: 'mysql',
    logging: false,
});

/**
 * Users
 * Example:
 *  { id: 1, name: "Don Joe" }
 */
export const User = sequelize.define(
    'User',
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        name: { type: DataTypes.STRING(255), allowNull: false, unique: true }
    },
    {
        tableName: "users",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
);

/**
 * GroceryList
 * Example:
 *  { id: 3, title: "Weekly Costco Run", user_id: 1 }
 */
export const GroceryList = sequelize.define(
    'GroceryList',
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        title: { type: DataTypes.STRING(255), allowNull: false }
    },
    {
        tableName: "grocery_lists",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
);

/**
 * Item
 * Example:
 *  { id: 10, list_id: 3, name: "Eggs", quantity: 12, checked: false }
 */
export const GroceryItem = sequelize.define(
    'GroceryItem',
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        name: { type: DataTypes.STRING(255), allowNull: false },
        quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
        checked: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
    },
    {
        tableName: "grocery_items",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
);

/**
 * Associations:
 * - User has many GroceryLists
 * - GroceryList belongs to User
 * - GroceryList has many GroceryItems
 * - GroceryItem belongs to GroceryList
 */
User.hasMany(GroceryList, { 
    foreignKey: 'user_id',
    as: 'grocery_lists',
    onDelete: 'CASCADE'
});

GroceryList.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
});

GroceryList.hasMany(GroceryItem, {
    foreignKey: 'list_id',
    as: 'items',
    onDelete: 'CASCADE'
});

GroceryItem.belongsTo(GroceryList, {
    foreignKey: 'list_id',
    as: 'grocery_list'
});

/**
 * initDb()
 * - connects to DB
 * - creates tables if they don't already exist
 *
 * THIS RUNS ON SERVER START.
 */
export const initDb = async () => {
    await sequelize.authenticate();
    await sequelize.sync(); // we use sync() because it's for demo use.
    console.log(chalk.green("Database synchronized"));
}