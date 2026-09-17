import { Link } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { orders } from '../../src/lib/mock-data';
import type { Order } from '../../src/lib/types';

const statusLabel: Record<Order['status'], string> = {
  pending: 'Pending',
  preparing: 'Preparing',
  'out-for-delivery': 'Out for delivery',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function OrdersScreen() {
  if (orders.length === 0) {
    return (
      <View className="flex-1 bg-background items-center justify-center p-6">
        <Text className="text-foreground font-headline text-2xl">No orders yet</Text>
        <Text className="text-muted-foreground text-center mt-2">
          Your order history will show up here.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      className="flex-1 bg-background"
      data={orders}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 16, gap: 12 }}
      renderItem={({ item }) => (
        <Link href={`/orders/${item.id}`} asChild>
          <Pressable className="bg-card border border-border rounded-xl p-4 active:opacity-80">
            <View className="flex-row justify-between items-center">
              <Text className="text-foreground font-headline text-lg">Order #{item.id.slice(-6)}</Text>
              <Text className="text-foreground text-xs uppercase font-bold bg-primary px-2 py-1 rounded-full">
                {statusLabel[item.status]}
              </Text>
            </View>
            <Text className="text-muted-foreground text-sm mt-1">
              {new Date(item.orderDate).toLocaleDateString()} · {item.items.length} item(s)
            </Text>
            <Text className="text-foreground font-bold mt-2">NRS {item.totalAmount.toLocaleString()}</Text>
          </Pressable>
        </Link>
      )}
    />
  );
}
