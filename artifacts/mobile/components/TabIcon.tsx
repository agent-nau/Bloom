import React from 'react';
import { Feather } from '@expo/vector-icons';
import { SymbolView } from 'expo-symbols';
import { Platform } from 'react-native';
import { useColors } from '@/hooks/useColors';

interface TabIconProps {
  name: string;
  color: string;
  size?: number;
}

export function TabIcon({ name, color, size = 22 }: TabIconProps) {
  const colors = useColors();
  const isIOS = Platform.OS === 'ios';

  if (isIOS) {
    // Map icon names to SF Symbols
    const symbolMap: Record<string, string> = {
      heart: 'heart',
      calendar: 'calendar',
      log: 'doc.text',
      user: 'person',
      insights: 'chart.bar',
    };

    const symbolName = symbolMap[name] || name;

    return (
      <SymbolView
        name={symbolName as any}
        tintColor={color}
        size={size + 2} // SF Symbols typically look better slightly larger
      />
    );
  }

  // Use Feather icons for non-iOS platforms
  const iconMap: Record<string, keyof typeof Feather.glyphMap> = {
    heart: 'heart',
    calendar: 'calendar',
    log: 'file-text',
    user: 'user',
    insights: 'bar-chart-2',
  };

  const iconName = iconMap[name] || 'circle';

  return <Feather name={iconName} size={size} color={color} />;
}
