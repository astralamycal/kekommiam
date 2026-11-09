/**
 * @file src/services/MealManager.ts
 * @description OOP Manager handling weekly meal scheduling and constraints with strict CRUD conventions.
 */

import * as SQLite from 'expo-sqlite';
import { Meal } from '../types';

export class MealManager {
  private db: SQLite.SQLiteDatabase;

  constructor(db: SQLite.SQLiteDatabase) {
    this.db = db;
  }

  /**
   * Schedules a new meal.
   */
  public async create(meal: Omit<Meal, 'id'>): Promise<number> {
    const stmt = await this.db.prepareAsync(`
      INSERT INTO meals (name, date, slot)
      VALUES (?, ?, ?)
    `);

    try {
      const result = await stmt.executeAsync([
        meal.name ?? null,
        meal.date,
        meal.slot,
      ]);
      return result.lastInsertRowId;
    } finally {
      await stmt.finalizeAsync();
    }
  }

  public async getAll(): Promise<Meal[]> {
    const rows = await this.db.getAllAsync<any>(
      'SELECT * FROM meals ORDER BY date ASC, slot ASC;'
    );
    return rows.map(this.mapRowToMeal);
  }

  public async findById(id: number): Promise<Meal | null> {
    const stmt = await this.db.prepareAsync('SELECT * FROM meals WHERE id = ?;');
    try {
      const result = await stmt.executeAsync([id]);
      const row = await result.getFirstAsync<any>();
      return row ? this.mapRowToMeal(row) : null;
    } finally {
      await stmt.finalizeAsync();
    }
  }

  public async updateById(id: number, meal: Partial<Omit<Meal, 'id'>>): Promise<void> {
    const stmt = await this.db.prepareAsync(`
      UPDATE meals 
      SET name = ?, date = ?, slot = ?
      WHERE id = ?
    `);

    try {
      await stmt.executeAsync([
        meal.name ?? null,
        meal.date ?? new Date().toISOString().split('T')[0],
        meal.slot ?? 'dinner',
        id,
      ]);
    } finally {
      await stmt.finalizeAsync();
    }
  }

  public async deleteById(id: number): Promise<void> {
    const stmt = await this.db.prepareAsync('DELETE FROM meals WHERE id = ?;');
    try {
      await stmt.executeAsync([id]);
    } finally {
      await stmt.finalizeAsync();
    }
  }

  /**
   * Logic constraint: Counts meat-containing meals in a specific weekly range.
   */
  public async countMeatMealsInWeek(startDate: string, endDate: string): Promise<number> {
    const stmt = await this.db.prepareAsync(`
      SELECT COUNT(DISTINCT m.id) as meatCount
      FROM meals m
      JOIN meal_dishes md ON m.id = md.meal_id
      JOIN dishes d ON md.dish_id = d.id
      WHERE m.date BETWEEN ? AND ? AND d.contains_meat = 1;
    `);

    try {
      const result = await stmt.executeAsync([startDate, endDate]);
      const row = await result.getFirstAsync<any>();
      return row ? row.meatCount : 0;
    } finally {
      await stmt.finalizeAsync();
    }
  }

  private mapRowToMeal(row: any): Meal {
    return {
      id: row.id,
      name: row.name,
      date: row.date,
      slot: row.slot,
    };
  }
}