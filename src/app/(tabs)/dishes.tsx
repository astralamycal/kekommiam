/**
 * @file src/app/(tabs)/dishes.tsx
 * @description Dishes tab screen rendering the dish library using the DishManager service and DishCard partial.
 */

import * as SQLite from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DishCard } from '../../components/dishes/DishCard';
import { Colors, Spacing } from '../../constants/theme';
import { DishManager } from '../../services/DishManager';
import { Dish } from '../../types';

export default function DishesScreen() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadDishes = useCallback(async () => {
    try {
      const db = await SQLite.openDatabaseAsync('kekommiam.db');
      const dishManager = new DishManager(db);
      const allDishes = await dishManager.getAll();
      setDishes(allDishes);
    } catch (err) {
      console.error('Failed to load dishes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDishes();
  }, [loadDishes]);

  const handleAddSampleDish = async () => {
    try {
      const db = await SQLite.openDatabaseAsync('kekommiam.db');
      const dishManager = new DishManager(db);
      await dishManager.create({
        name: 'Spaghetti Bolognese',
        categoryId: 1,
        role: 'complete',
        containsMeat: true,
        rating: 5,
      });
      loadDishes();
    } catch (err) {
      console.error('Failed to create sample dish:', err);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dish Library</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddSampleDish}>
          <Text style={styles.addButtonText}>+ Add Test Dish</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={dishes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <DishCard dish={item} />}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.emptyText}>No dishes found. Tap above to add your first recipe!</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.medium,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  addButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  listContainer: {
    paddingBottom: Spacing.large,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    marginTop: 32,
  },
});