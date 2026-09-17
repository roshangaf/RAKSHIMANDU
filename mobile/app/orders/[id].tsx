import { useLocalSearchParams } from 'expo-router';
import { CheckCircle2, Circle } from 'lucide-react-native';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { orders } from '../../src/lib/mock-data';
import type { Order } from '../../src/lib/types';
import { colors } from '../../src/theme/colors';

const steps: Order['status'][] = ['pending', 'preparing', 'out-for-delivery', 'completed'];
const stepLabel: Record<Order['status'], string> = {
  pending: 'Order placed',
  preparing: 'Preparing',
  'out-for-delivery': 'Out for delivery',
  completed: 'Delivered',
  cancelled: 'Cancelled',
};

export default function OrderTrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const order = orders.find((o) => o.id === id);

  if (!order) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Text className="text-foreground">Order not found.</Text>
      </View>
    );
  }

  const currentIndex = steps.indexOf(order.status);

  return (
    <ScrollView className="flex-1 bg-background p-6">
      <Text className="text-foreground font-headline text-2xl">Order #{order.id.slice(-6)}</Text>
      {order.expectedDeliveryTime ? (
        <Text className="text-muted-foreground mt-1">
          Expected by {new Date(order.expectedDeliveryTime).toLocaleTimeString()}
        </Text>
      ) : null}

      <View className="mt-8">
        {steps.map((step, i) => {
          const done = i <= currentIndex;
          return (
            <View key={step} className="flex-row items-center mb-6">
              {done ? (
                <CheckCircle2 size={22} color={colors.foreground} />
              ) : (
                <Circle size={22} color={colors.mutedForeground} />
              )}
              <Text className={done ? 'text-foreground ml-3 font-bold' : 'text-muted-foreground ml-3'}>
                {stepLabel[step]}
              </Text>
            </View>
          );
        })}
      </View>

      <View className="border-t border-border pt-4 mt-2">
        <Text className="text-foreground font-headline text-lg mb-2">Items</Text>
        {order.items.map((item) => (
          <View key={item.productId} className="flex-row justify-between mb-1">
            <Text className="text-muted-foreground">
              {item.quantity}× {item.name}
            </Text>
            <Text className="text-foreground">NRS {(item.price * item.quantity).toLocaleString()}</Text>
          </View>
        ))}
        <View className="flex-row justify-between mt-3 pt-3 border-t border-border">
          <Text className="text-foreground font-bold">Total</Text>
          <Text className="text-foreground font-bold">NRS {order.totalAmount.toLocaleString()}</Text>
        </View>
      </View>
    </ScrollView>
  );
}
