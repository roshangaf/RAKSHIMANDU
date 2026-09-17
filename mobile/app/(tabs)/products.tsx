import { useLocalSearchParams } from 'expo-router';
import { Search } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { ProductCard } from '../../src/components/ProductCard';
import { products } from '../../src/lib/mock-data';
import type { Category } from '../../src/lib/types';
import { colors } from '../../src/theme/colors';

const categories: Category[] = ['Spirits', 'Wine', 'Beer', 'Snacks', 'Bundles', 'Vapes'];

export default function ProductsScreen() {
  const params = useLocalSearchParams<{ category?: string }>();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category | null>(
    (params.category as Category) ?? null
  );

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = !activeCategory || p.category === activeCategory;
      const matchesQuery = p.name.toLowerCase().includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [query, activeCategory]);

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center bg-card border border-border rounded-xl mx-4 mt-4 px-3">
        <Search size={16} color={colors.mutedForeground} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search products..."
          placeholderTextColor={colors.mutedForeground}
          className="flex-1 text-foreground px-2 py-3"
        />
      </View>

      <FlatList
        horizontal
        data={categories}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}
        renderItem={({ item }) => {
          const active = activeCategory === item;
          return (
            <Pressable
              onPress={() => setActiveCategory(active ? null : item)}
              className={`px-4 py-2 rounded-full border ${active ? 'bg-foreground border-foreground' : 'bg-card border-border'}`}
            >
              <Text className={active ? 'text-background text-sm font-bold' : 'text-foreground text-sm'}>
                {item}
              </Text>
            </Pressable>
          );
        }}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{ padding: 16, gap: 16 }}
        columnWrapperStyle={{ gap: 16 }}
        renderItem={({ item }) => <ProductCard product={item} />}
        ListEmptyComponent={
          <Text className="text-muted-foreground text-center mt-12">No products match your search.</Text>
        }
      />
    </View>
  );
}
