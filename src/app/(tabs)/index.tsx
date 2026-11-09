/**
 * @file src/app/(tabs)/index.tsx
 * @description Planner tab screen rendering weekly scheduled meals and constraint tracking.
 */

import * as SQLite from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Spacing } from '../../constants/theme';
import { MealManager } from '../../services/MealManager';
import { Meal } from '../../types';

export default function PlannerScreen() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [meatCount, setMeatCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Helper date range for the current week demonstration
  const startDate = '2026-06-01';
  const endDate = '2026-06-07';

  const loadPlannerData = useCallback(async () => {
    try {
      const db = await SQLite.openDatabaseAsync('kekommiam.db');
      const mealManager = new MealManager(db);

      // Fetch scheduled meals and calculate constraint count in parallel
      const [weeklyMeals, count] = await Promise.all([
        mealManager.getAll(),
        mealManager.countMeatMealsInWeek(startDate, endDate),
      ]);

      setMeals(weeklyMeals);
      setMeatCount(count);
    } catch (err) {
      console.error('Failed to load planner data:', err);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    loadPlannerData();
  }, [loadPlannerData]);

  const handleScheduleTestMeal = async () => {
    try {
      const db = await SQLite.openDatabaseAsync('kekommiam.db');
      const mealManager = new MealManager(db);
      
      await mealManager.create({
        name: 'Spaghetti Bolognese',
        date: startDate,
        slot: 'dinner',
      });

      loadPlannerData();
    } catch (err) {
      console.error('Failed to schedule meal:', err);
    }
  };

  return (
    <View style={styles.container}>
      {/* Constraint Tracker Banner */}
      <View style={styles.constraintCard}>
        <Text style={styles.constraintTitle}>Weekly Constraints</Text>
        <Text style={styles.constraintText}>
          🥩 Meat Meals: <Text style={styles.highlight}>{meatCount} / 3</Text>
        </Text>
      </View>

      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Scheduled Meals</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleScheduleTestMeal}>
          <Text style={styles.addButtonText}>+ Schedule Test Meal</Text>
        </TouchableOpacity>
      </View>

      {/* Scheduled Meals List */}
      <FlatList
        data={meals}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.mealCard}>
            <View>
              <Text style={styles.mealName}>{item.name ?? 'Unnamed Meal'}</Text>
              <Text style={styles.mealDetails}>📅 {item.date} | Slot: {item.slot}</Text>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.emptyText}>No meals scheduled for this week yet.</Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.medium,
  },
  constraintCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    padding: Spacing.medium,
    marginBottom: Spacing.medium,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  constraintTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  constraintText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  highlight: {
    fontWeight: 'bold',
    color: Colors.primary,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.small,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  addButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 12,
  },
  listContainer: {
    paddingBottom: Spacing.large,
  },
  mealCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: Spacing.medium,
    marginBottom: Spacing.small,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  mealDetails: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    marginTop: 32,
  },
});