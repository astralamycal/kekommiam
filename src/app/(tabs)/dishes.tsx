/**
 * @file src/app/(tabs)/dishes.tsx
 * @description Dish Library tab screen.
 */

import { StyleSheet, Text, View } from 'react-native';

export default function DishesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dish Library</Text>
      <Text style={styles.subtitle}>Manage your recipes and dishes here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6c757d',
  },
});