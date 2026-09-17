// Mirrors the CSS custom properties in ../../../src/app/globals.css (the web app's theme).
// Keep in sync by hand until both apps read from one shared design-token source.
export const colors = {
  background: '#080808',
  foreground: '#FFFFFF',
  card: '#0F0F0F',
  cardForeground: '#FFFFFF',
  popover: '#080808',
  popoverForeground: '#FFFFFF',
  primary: '#310F0C', // Oxblood
  primaryForeground: '#FFFFFF',
  secondary: '#1A1A1A',
  secondaryForeground: '#FFFFFF',
  muted: '#262626',
  mutedForeground: '#A6A6A6',
  accent: '#FFFFFF',
  accentForeground: '#000000',
  destructive: '#7F1D1D',
  destructiveForeground: '#FAFAFA',
  border: '#1F1F1F',
  input: '#1F1F1F',
  ring: '#4A1512',
} as const;

export const radius = {
  lg: 8,
  md: 6,
  sm: 4,
} as const;

// Nested shape for tailwind.config.js, matching ../../tailwind.config.ts's token names
// (`bg-card`, `text-muted-foreground`, etc.) so class names read the same in both apps.
export const tailwindColors = {
  background: colors.background,
  foreground: colors.foreground,
  card: { DEFAULT: colors.card, foreground: colors.cardForeground },
  popover: { DEFAULT: colors.popover, foreground: colors.popoverForeground },
  primary: { DEFAULT: colors.primary, foreground: colors.primaryForeground },
  secondary: { DEFAULT: colors.secondary, foreground: colors.secondaryForeground },
  muted: { DEFAULT: colors.muted, foreground: colors.mutedForeground },
  accent: { DEFAULT: colors.accent, foreground: colors.accentForeground },
  destructive: { DEFAULT: colors.destructive, foreground: colors.destructiveForeground },
  border: colors.border,
  input: colors.input,
  ring: colors.ring,
} as const;
