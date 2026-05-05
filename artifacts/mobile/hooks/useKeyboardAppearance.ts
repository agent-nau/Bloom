import { Platform } from "react-native";
import { useTheme } from "@/context/ThemeContext";

export function useKeyboardAppearance() {
  const { isDark } = useTheme();
  
  return Platform.OS === 'ios' ? (isDark ? 'dark' as const : 'light' as const) : undefined;
}
