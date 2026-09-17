import { MessageCircle } from 'lucide-react-native';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { colors } from '../src/theme/colors';

export default function SupportScreen() {
  return (
    <View className="flex-1 bg-background items-center justify-center p-6">
      <MessageCircle size={40} color={colors.foreground} />
      <Text className="text-foreground font-headline text-2xl mt-4">Need help?</Text>
      <Text className="text-muted-foreground text-center mt-2">
        Our support team is here for order or product questions, day or night.
      </Text>
      <Pressable className="bg-foreground rounded-xl px-6 py-3 mt-6 active:opacity-80">
        <Text className="text-background font-bold">Start a chat</Text>
      </Pressable>
    </View>
  );
}
