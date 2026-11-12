/**
 * @file src/db/database.ts
 * @description SQLite database initialization and singleton connection manager.
 */

import * as SQLite from "expo-sqlite";

let dbInstance: SQLite.SQLiteDatabase | null = null;

/**
 * Returns the active database instance, opening it only once.
 *
 * @returns {Promise<SQLite.SQLiteDatabase>} Active SQLite database handle.
 */
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync("kekommiam.db");
    await dbInstance.execAsync("PRAGMA foreign_keys = ON;");
  }
  return dbInstance;
}

/**
 * Initializes all database tables and constraints on app boot.
 *
 * @returns {Promise<SQLite.SQLiteDatabase>} Initialized SQLite database.
 */
export async function initializeDatabase(): Promise<SQLite.SQLiteDatabase> {
  const db = await getDatabase();

  await db.execAsync(`
    -- 1. Categories Table
    CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
    );

    -- 2. Ingredients Table
    CREATE TABLE IF NOT EXISTS ingredients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
    );

    -- 3. Dishes Table
    CREATE TABLE IF NOT EXISTS dishes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category_id INTEGER,
        role TEXT CHECK(role IN ('complete', 'base', 'protein')) NOT NULL,
        contains_meat INTEGER NOT NULL DEFAULT 0,
        rating INTEGER DEFAULT 3 CHECK(rating BETWEEN 1 AND 5),
        last_eaten_at TEXT,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    );

    -- 4. Dish Ingredients (Junction Table)
    CREATE TABLE IF NOT EXISTS dish_ingredients (
        dish_id INTEGER NOT NULL,
        ingredient_id INTEGER NOT NULL,
        quantity REAL NOT NULL,
        unit TEXT NOT NULL,
        PRIMARY KEY (dish_id, ingredient_id),
        FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE CASCADE,
        FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE
    );

    -- 5. Meals Table (Scheduled events)
    CREATE TABLE IF NOT EXISTS meals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        date TEXT NOT NULL,
        slot TEXT CHECK(slot IN ('breakfast', 'lunch', 'dinner')) NOT NULL
    );

    -- 6. Meal Dishes (Junction Table)
    CREATE TABLE IF NOT EXISTS meal_dishes (
        meal_id INTEGER NOT NULL,
        dish_id INTEGER NOT NULL,
        PRIMARY KEY (meal_id, dish_id),
        FOREIGN KEY (meal_id) REFERENCES meals(id) ON DELETE CASCADE,
        FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE CASCADE
    );
  `);

  console.log("Database initialized successfully with all tables.");
  return db;
}