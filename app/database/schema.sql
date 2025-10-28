-- Create the database (no quotes, they should be backticks or none at all)
CREATE DATABASE IF NOT EXISTS grocery_db;

-- Select the database
USE grocery_db;

-- Users table
CREATE TABLE IF NOT EXISTS Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- Grocery lists table
CREATE TABLE IF NOT EXISTS GroceryLists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- Grocery items table
CREATE TABLE IF NOT EXISTS GroceryItems (
    id INT AUTO_INCREMENT PRIMARY KEY,
    list_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    quantity INT DEFAULT 1,
    checked BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (list_id) REFERENCES GroceryLists(id) ON DELETE CASCADE
);
