import { useLocalSearchParams } from 'expo-router';
import { Star } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { products } from '../../src/lib/mock-data';
import { useCart } from '../../src/providers/cart-provider';
import { colors } from '../../src/theme/colors';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const product = products.find((p) => p.id === id);
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  if (!product) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Text className="text-foreground">Product not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background">
      <Image source={{ uri: product.imageUrl }} className="w-full h-80" resizeMode="cover" />
      <View className="p-6">
        {product.isAgeRestricted ? (
          <Text className="text-primary-foreground bg-primary self-start text-xs font-bold uppercase px-2 py-1 rounded-full mb-2">
            21+ Age Restricted
          </Text>
        ) : null}
        {product.brand ? <Text className="text-muted-foreground uppercase text-xs">{product.brand}</Text> : null}
        <Text className="text-foreground font-headline text-3xl">{product.name}</Text>
        <View className="flex-row items-center mt-1">
          <Star size={14} color={colors.foreground} fill={colors.foreground} />
          <Text className="text-muted-foreground text-sm ml-1">{product.rating.toFixed(1)} rating</Text>
        </View>
        <Text className="text-foreground text-2xl font-bold mt-4">
          NRS {product.price.toLocaleString()}
        </Text>
        <Text className="text-muted-foreground mt-3 leading-relaxed">{product.description}</Text>

        <Pressable
          onPress={() => {
            addToCart(product);
            setAdded(true);
          }}
          className="bg-foreground rounded-xl py-4 items-center mt-6 active:opacity-80"
        >
          <Text className="text-background font-bold uppercase tracking-wide">
            {added ? 'Added to cart ✓' : 'Add to Cart'}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
