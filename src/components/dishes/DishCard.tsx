/**
 * @file src/components/dishes/DishCard.tsx
 * @description Reusable partial component for rendering individual dish details.
 */

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Spacing } from '../../constants/theme';
import { Dish } from '../../types';

interface DishCardProps {
  dish: Dish;
  onPress?: () => void;
}

export function DishCard({ dish, onPress }: DishCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.headerRow}>
        <Text style={styles.name}>{dish.name}</Text>
        <Text style={styles.rating}>⭐ {dish.rating}/5</Text>
      </View>
      <View style={styles.footerRow}>
        <Text style={styles.badge}>Role: {dish.role}</Text>
        <Text style={[styles.badge, dish.containsMeat ? styles.meatBadge : styles.vegBadge]}>
          {dish.containsMeat ? '🥩 Contains Meat' : '🌱 Vegetarian'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    padding: Spacing.medium,
    marginBottom: Spacing.small,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.small,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  rating: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  footerRow: {
    flexDirection: 'row',
    gap: Spacing.small,
  },
  badge: {
    fontSize: 12,
    color: Colors.textSecondary,
    backgroundColor: Colors.border,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  meatBadge: {
    backgroundColor: '#ffe3e3',
    color: '#c92a2a',
  },
  vegBadge: {
    backgroundColor: '#ebfbee',
    color: '#2b8a3e',
  },
});