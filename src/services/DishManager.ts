/**
 * @file src/services/DishManager.ts
 * @description OOP Manager class handling CRUD operations for dishes securely using direct async helpers.
 */

import * as SQLite from 'expo-sqlite';
import { Dish } from '../types';

export class DishManager {
  private db: SQLite.SQLiteDatabase;

  constructor(db: SQLite.SQLiteDatabase) {
    this.db = db;
  }

  /**
   * Creates a new dish securely (Create).
   */
  public async create(dish: Omit<Dish, 'id' | 'lastEatenAt'>): Promise<number> {
    const result = await this.db.runAsync(
      `INSERT INTO dishes (name, category_id, role, contains_meat, rating) VALUES (?, ?, ?, ?, ?)`,
      [dish.name, dish.categoryId, dish.role, dish.containsMeat ? 1 : 0, dish.rating]
    );
    return result.lastInsertRowId;
  }

  /**
   * Retrieves all dishes sorted alphabetically (Read / GetAll).
   */
  public async getAll(): Promise<Dish[]> {
    const rows = await this.db.getAllAsync<any>('SELECT * FROM dishes ORDER BY name ASC;');
    return rows.map(this.mapRowToDish);
  }

  /**
   * Finds a specific dish by its unique ID (Read / FindById).
   */
  public async findById(id: number): Promise<Dish | null> {
    const row = await this.db.getFirstAsync<any>('SELECT * FROM dishes WHERE id = ?;', [id]);
    return row ? this.mapRowToDish(row) : null;
  }

  /**
   * Finds dishes matching a specific name search query (Read / FindByName).
   */
  public async findByName(nameQuery: string): Promise<Dish[]> {
    const rows = await this.db.getAllAsync<any>(
      'SELECT * FROM dishes WHERE name LIKE ? ORDER BY name ASC;',
      [`%${nameQuery}%`]
    );
    return rows.map(this.mapRowToDish);
  }

  /**
   * Updates an existing dish by ID (Update).
   */
  public async updateById(id: number, dish: Partial<Omit<Dish, 'id'>>): Promise<void> {
    await this.db.runAsync(
      `UPDATE dishes SET name = ?, category_id = ?, role = ?, contains_meat = ?, rating = ?, last_eaten_at = ? WHERE id = ?`,
      [
        dish.name ?? null,
        dish.categoryId ?? null,
        dish.role ?? 'complete',
        dish.containsMeat ? 1 : 0,
        dish.rating ?? 3,
        dish.lastEatenAt ?? null,
        id,
      ]
    );
  }

  /**
   * Deletes a dish by ID (Delete).
   */
  public async deleteById(id: number): Promise<void> {
    await this.db.runAsync('DELETE FROM dishes WHERE id = ?;', [id]);
  }

  /**
   * Helper utility to map snake_case SQLite rows to camelCase TypeScript objects.
   */
  private mapRowToDish(row: any): Dish {
    return {
      id: row.id,
      name: row.name,
      categoryId: row.category_id,
      role: row.role,
      containsMeat: row.contains_meat === 1,
      rating: row.rating,
      lastEatenAt: row.last_eaten_at,
    };
  }
}