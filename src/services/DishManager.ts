/**
 * @file src/services/DishManager.ts
 * @description OOP Manager class handling CRUD operations for dishes securely.
 */

import * as SQLite from 'expo-sqlite';
import { Dish } from '../types';

export class DishManager {
  private db: SQLite.SQLiteDatabase;

  constructor(db: SQLite.SQLiteDatabase) {
    this.db = db;
  }

  public async create(dish: Omit<Dish, 'id' | 'lastEatenAt'>): Promise<number> {
    const stmt = await this.db.prepareAsync(`
      INSERT INTO dishes (name, category_id, role, contains_meat, rating)
      VALUES (?, ?, ?, ?, ?)
    `);

    try {
      const result = await stmt.executeAsync([
        dish.name,
        dish.categoryId,
        dish.role,
        dish.containsMeat ? 1 : 0,
        dish.rating,
      ]);
      return result.lastInsertRowId;
    } finally {
      await stmt.finalizeAsync();
    }
  }

  public async getAll(): Promise<Dish[]> {
    const rows = await this.db.getAllAsync<any>('SELECT * FROM dishes ORDER BY name ASC;');
    return rows.map(this.mapRowToDish);
  }

  public async findById(id: number): Promise<Dish | null> {
    const stmt = await this.db.prepareAsync('SELECT * FROM dishes WHERE id = ?;');
    try {
      const result = await stmt.executeAsync([id]);
      const row = await result.getFirstAsync<any>();
      return row ? this.mapRowToDish(row) : null;
    } finally {
      await stmt.finalizeAsync();
    }
  }

  public async findByName(nameQuery: string): Promise<Dish[]> {
    const stmt = await this.db.prepareAsync('SELECT * FROM dishes WHERE name LIKE ? ORDER BY name ASC;');
    try {
      const result = await stmt.executeAsync([`%${nameQuery}%`]);
      const rows = await result.getAllAsync<any>();
      return rows.map(this.mapRowToDish);
    } finally {
      await stmt.finalizeAsync();
    }
  }

  public async updateById(id: number, dish: Partial<Omit<Dish, 'id'>>): Promise<void> {
    const stmt = await this.db.prepareAsync(`
      UPDATE dishes 
      SET name = ?, category_id = ?, role = ?, 
          contains_meat = ?, rating = ?, last_eaten_at = ?
      WHERE id = ?
    `);

    try {
      await stmt.executeAsync([
        dish.name ?? null,
        dish.categoryId ?? null,
        dish.role ?? 'complete',
        dish.containsMeat ? 1 : 0,
        dish.rating ?? 3,
        dish.lastEatenAt ?? null,
        id,
      ]);
    } finally {
      await stmt.finalizeAsync();
    }
  }

  public async deleteById(id: number): Promise<void> {
    const stmt = await this.db.prepareAsync('DELETE FROM dishes WHERE id = ?;');
    try {
      await stmt.executeAsync([id]);
    } finally {
      await stmt.finalizeAsync();
    }
  }

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