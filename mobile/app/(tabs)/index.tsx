import { Link } from 'expo-router';
import { Zap } from 'lucide-react-native';
import React from 'react';
import { FlatList, Image, ScrollView, Text, View } from 'react-native';
import { ProductCard } from '../../src/components/ProductCard';
import { products } from '../../src/lib/mock-data';
import { colors } from '../../src/theme/colors';

const categories = ['Spirits', 'Wine', 'Beer', 'Snacks', 'Bundles', 'Vapes'] as const;

export default function HomeScreen() {
  const featured = products.filter((p) => p.isFeatured);

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ paddingBottom: 32 }}>
      <View className="p-6">
        <Text className="text-foreground font-headline text-4xl leading-tight">
          THE VALLEY&apos;S{'\n'}ELITE LATE-NIGHT SOCIETY
        </Text>
        <Text className="text-muted-foreground mt-2">
          Earn points on every order, unlock free shipping, and get priority access to our vintage
          cellar.
        </Text>
      </View>

      <View className="flex-row items-center bg-primary/20 border-y border-border px-6 py-3">
        <Zap size={16} color={colors.foreground} />
        <Text className="text-foreground text-xs font-bold uppercase tracking-[3px] ml-2">
          Active delivery: ~22 mins
        </Text>
      </View>

      <View className="mt-6">
        <Text className="text-foreground font-headline text-xl px-6 mb-3">Categories</Text>
        <FlatList
          horizontal
          data={categories}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
          renderItem={({ item }) => (
            <Link href={{ pathname: '/(tabs)/products', params: { category: item } }} asChild>
              <View className="px-4 py-2 rounded-full border border-border bg-card">
                <Text className="text-foreground text-sm">{item}</Text>
              </View>
            </Link>
          )}
        />
      </View>

      <View className="mt-8">
        <Text className="text-foreground font-headline text-xl px-6 mb-3">Featured</Text>
        <FlatList
          horizontal
          data={featured}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}
          renderItem={({ item }) => <ProductCard product={item} />}
        />
      </View>

      <Link href="/loyalty" asChild>
        <View className="mx-6 mt-8 rounded-2xl overflow-hidden border border-border">
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1758405217697-0c98bcf3b3d6?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0',
            }}
            className="w-full h-32"
            resizeMode="cover"
          />
          <View className="p-4 bg-card">
            <Text className="text-foreground font-headline text-lg">CLUB घ्याम्पे</Text>
            <Text className="text-muted-foreground text-sm">Join the loyalty program →</Text>
          </View>
        </View>
      </Link>
    </ScrollView>
  );
}
