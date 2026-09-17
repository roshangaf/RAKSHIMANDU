import React from 'react';
import { Image, ScrollView, Text, View } from 'react-native';

export default function LoyaltyScreen() {
  return (
    <ScrollView className="flex-1 bg-background">
      <Image
        source={{
          uri: 'https://images.unsplash.com/photo-1758405217697-0c98bcf3b3d6?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0',
        }}
        className="w-full h-48"
        resizeMode="cover"
      />
      <View className="p-6">
        <Text className="text-foreground font-headline text-3xl">CLUB घ्याम्पे</Text>
        <Text className="text-muted-foreground mt-2 leading-relaxed">
          Join the valley&apos;s elite late-night society. Earn points on every order, unlock free
          shipping, and get priority access to our vintage cellar.
        </Text>

        <View className="bg-card border border-border rounded-xl p-4 mt-6">
          <Text className="text-muted-foreground text-sm">Your points</Text>
          <Text className="text-foreground font-headline text-4xl">0</Text>
          <Text className="text-muted-foreground text-xs mt-1">Sign in to start earning points.</Text>
        </View>
      </View>
    </ScrollView>
  );
}
