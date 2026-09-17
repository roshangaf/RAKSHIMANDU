import { Minus, Plus, Trash2 } from 'lucide-react-native';
import React from 'react';
import { FlatList, Image, Pressable, Text, View } from 'react-native';
import { useCart } from '../../src/providers/cart-provider';
import { colors } from '../../src/theme/colors';

export default function CartScreen() {
  const { items, updateQuantity, removeFromCart, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <View className="flex-1 bg-background items-center justify-center p-6">
        <Text className="text-foreground font-headline text-2xl">Your cart is empty</Text>
        <Text className="text-muted-foreground text-center mt-2">
          Browse the catalog to add liquor and snacks to your order.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item }) => (
          <View className="flex-row bg-card border border-border rounded-xl p-3">
            <Image source={{ uri: item.imageUrl }} className="w-16 h-16 rounded-lg" resizeMode="cover" />
            <View className="flex-1 ml-3 justify-center">
              <Text className="text-foreground font-headline text-base" numberOfLines={1}>
                {item.name}
              </Text>
              <Text className="text-muted-foreground text-sm">NRS {item.price.toLocaleString()}</Text>
              <View className="flex-row items-center mt-2">
                <Pressable
                  onPress={() => updateQuantity(item.id, item.quantity - 1)}
                  className="w-7 h-7 rounded-full bg-secondary items-center justify-center"
                >
                  <Minus size={14} color={colors.foreground} />
                </Pressable>
                <Text className="text-foreground mx-3">{item.quantity}</Text>
                <Pressable
                  onPress={() => updateQuantity(item.id, item.quantity + 1)}
                  className="w-7 h-7 rounded-full bg-secondary items-center justify-center"
                >
                  <Plus size={14} color={colors.foreground} />
                </Pressable>
              </View>
            </View>
            <Pressable onPress={() => removeFromCart(item.id)} className="justify-center pl-2">
              <Trash2 size={18} color={colors.destructive} />
            </Pressable>
          </View>
        )}
      />

      <View className="border-t border-border p-4">
        <View className="flex-row justify-between mb-4">
          <Text className="text-muted-foreground">Subtotal</Text>
          <Text className="text-foreground font-bold text-lg">NRS {totalPrice.toLocaleString()}</Text>
        </View>
        <Pressable className="bg-foreground rounded-xl py-4 items-center active:opacity-80">
          <Text className="text-background font-bold uppercase tracking-wide">Checkout</Text>
        </Pressable>
      </View>
    </View>
  );
}
