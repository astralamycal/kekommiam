/**
 * @file src/app/(tabs)/_layout.tsx
 * @description Bottom navigation tabs layout.
 */

import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#2b8a3e' }}>
      <Tabs.Screen 
        name="index" 
        options={{ title: 'Planner', headerTitle: 'Weekly Planner' }} 
      />
      <Tabs.Screen 
        name="dishes" 
        options={{ title: 'Dishes', headerTitle: 'Dish Library' }} 
      />
      <Tabs.Screen 
        name="smart" 
        options={{ title: 'Smart', headerTitle: 'Suggestions' }} 
      />
    </Tabs>
  );
}