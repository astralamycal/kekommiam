/**
 * @file src/services/MealManager.ts
 * @description OOP Manager handling weekly meal scheduling and constraints.
 */

import * as SQLite from 'expo-sqlite';
import { Meal } from '../types';

export class MealManager {
  private db: SQLite.SQLiteDatabase;

  constructor(db: SQLite.SQLiteDatabase) {
    this.db = db;
  }

  public async create(meal: Omit<Meal, 'id'>): Promise<number> {
    const result = await this.db.runAsync(
      `INSERT INTO meals (name, date, slot) VALUES (?, ?, ?)`,
      [meal.name ?? null, meal.date, meal.slot]
    );
    return result.lastInsertRowId;
  }

  public async getAll(): Promise<Meal[]> {
    const rows = await this.db.getAllAsync<any>('SELECT * FROM meals ORDER BY date ASC, slot ASC;');
    return rows.map(this.mapRowToMeal);
  }

  public async findById(id: number): Promise<Meal | null> {
    const row = await this.db.getFirstAsync<any>('SELECT * FROM meals WHERE id = ?;', [id]);
    return row ? this.mapRowToMeal(row) : null;
  }

  public async updateById(id: number, meal: Partial<Omit<Meal, 'id'>>): Promise<void> {
    await this.db.runAsync(
      `UPDATE meals SET name = ?, date = ?, slot = ? WHERE id = ?`,
      [meal.name ?? null, meal.date ?? new Date().toISOString().split('T')[0], meal.slot ?? 'dinner', id]
    );
  }

  public async deleteById(id: number): Promise<void> {
    await this.db.runAsync('DELETE FROM meals WHERE id = ?;', [id]);
  }

  public async countMeatMealsInWeek(startDate: string, endDate: string): Promise<number> {
    const row = await this.db.getFirstAsync<any>(
      `SELECT COUNT(DISTINCT m.id) as meatCount
       FROM meals m
       JOIN meal_dishes md ON m.id = md.meal_id
       JOIN dishes d ON md.dish_id = d.id
       WHERE m.date BETWEEN ? AND ? AND d.contains_meat = 1;`,
      [startDate, endDate]
    );
    return row ? row.meatCount : 0;
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