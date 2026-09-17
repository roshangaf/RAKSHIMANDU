import { Link } from 'expo-router';
import { Star } from 'lucide-react-native';
import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import type { Product } from '../lib/types';

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/product/${product.id}`} asChild>
      <Pressable className="w-44 rounded-2xl bg-card border border-border overflow-hidden active:opacity-80">
        <Image source={{ uri: product.imageUrl }} className="w-full h-40" resizeMode="cover" />
        <View className="p-3">
          {product.brand ? (
            <Text className="text-muted-foreground text-xs uppercase tracking-wide" numberOfLines={1}>
              {product.brand}
            </Text>
          ) : null}
          <Text className="text-foreground font-headline text-lg" numberOfLines={1}>
            {product.name}
          </Text>
          <View className="flex-row items-center justify-between mt-1">
            <Text className="text-foreground font-bold">NRS {product.price.toLocaleString()}</Text>
            <View className="flex-row items-center">
              <Star size={12} color={colors.foreground} fill={colors.foreground} />
              <Text className="text-muted-foreground text-xs ml-1">{product.rating.toFixed(1)}</Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}
