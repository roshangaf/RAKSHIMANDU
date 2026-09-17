import React from 'react';
import { FlatList, Image, Text, View } from 'react-native';
import { pairings, products } from '../src/lib/mock-data';

export default function PairingsScreen() {
  return (
    <FlatList
      className="flex-1 bg-background"
      data={pairings}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 16, gap: 16 }}
      renderItem={({ item }) => {
        const liquor = products.find((p) => p.id === item.liquorProductId);
        const snack = products.find((p) => p.id === item.snackProductId);
        return (
          <View className="bg-card border border-border rounded-xl overflow-hidden">
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} className="w-full h-36" resizeMode="cover" />
            ) : null}
            <View className="p-4">
              <Text className="text-foreground font-headline text-xl">{item.name}</Text>
              <Text className="text-muted-foreground mt-1">{item.description}</Text>
              <Text className="text-muted-foreground text-xs mt-2">
                {liquor?.name} + {snack?.name}
              </Text>
            </View>
          </View>
        );
      }}
    />
  );
}
