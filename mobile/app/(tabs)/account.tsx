import { Link } from 'expo-router';
import { ChevronRight, Gift, HelpCircle, LogIn, Sparkles } from 'lucide-react-native';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { colors } from '../../src/theme/colors';

const links = [
  { href: '/loyalty', label: 'CLUB घ्याम्पे Loyalty', icon: Gift },
  { href: '/pairings', label: 'Pairings', icon: Sparkles },
  { href: '/support', label: 'Support', icon: HelpCircle },
] as const;

export default function AccountScreen() {
  return (
    <View className="flex-1 bg-background p-6">
      <View className="items-center mb-8 mt-4">
        <Text className="text-foreground font-headline text-3xl">RAKSHIMANDU</Text>
        <Text className="text-muted-foreground mt-1">Sign in to track orders and earn rewards</Text>
        <Pressable className="flex-row items-center bg-foreground rounded-xl px-6 py-3 mt-4 active:opacity-80">
          <LogIn size={16} color={colors.background} />
          <Text className="text-background font-bold ml-2">Sign In / Sign Up</Text>
        </Pressable>
      </View>

      <View className="gap-3">
        {links.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} asChild>
            <Pressable className="flex-row items-center justify-between bg-card border border-border rounded-xl px-4 py-4 active:opacity-80">
              <View className="flex-row items-center">
                <Icon size={18} color={colors.foreground} />
                <Text className="text-foreground ml-3">{label}</Text>
              </View>
              <ChevronRight size={18} color={colors.mutedForeground} />
            </Pressable>
          </Link>
        ))}
      </View>
    </View>
  );
}
