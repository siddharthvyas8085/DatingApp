/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1F102A',
    background: '#FFF8FB',
    backgroundElement: '#FFE4EF',
    backgroundSelected: '#FFD3E5',
    textSecondary: '#8F5E7A',
    accent: '#FF4D8D',
    accentSoft: '#FFE3EC',
    card: '#FFFFFF',
    border: '#F7D7E5',
    success: '#2FB57A',
  },
  dark: {
    text: '#F9EBF3',
    background: '#1A0E1F',
    backgroundElement: '#2B1A2E',
    backgroundSelected: '#3D243C',
    textSecondary: '#D6AFC0',
    accent: '#FF7AAF',
    accentSoft: '#3D213D',
    card: '#241726',
    border: '#4B3044',
    success: '#57D49A',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
