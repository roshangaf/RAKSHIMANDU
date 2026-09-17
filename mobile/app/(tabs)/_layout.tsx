import { Tabs } from 'expo-router';
import { Home, ShoppingBag, ShoppingCart, Truck, User } from 'lucide-react-native';
import React from 'react';
import { colors } from '../../src/theme/colors';
import { useCart } from '../../src/providers/cart-provider';

export default function TabsLayout() {
  const { totalItems } = useCart();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.foreground,
        headerTitleStyle: { fontFamily: 'BebasNeue', fontSize: 22 },
        tabBarStyle: { backgroundColor: colors.background, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.foreground,
        tabBarInactiveTintColor: colors.mutedForeground,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'RAKSHIMANDU', tabBarLabel: 'Home', tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="products"
        options={{ title: 'Catalog', tabBarLabel: 'Shop', tabBarIcon: ({ color, size }) => <ShoppingBag color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color, size }) => <ShoppingCart color={color} size={size} />,
          tabBarBadge: totalItems > 0 ? totalItems : undefined,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{ title: 'Orders', tabBarIcon: ({ color, size }) => <Truck color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="account"
        options={{ title: 'Account', tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }}
      />
    </Tabs>
  );
}
