import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import { Feather } from "@expo/vector-icons";
import React, { useMemo, useCallback } from "react";
import { Platform, StyleSheet, View, useColorScheme } from "react-native";

import { useColors } from "@/hooks/useColors";
import { useTheme } from "@/context/ThemeContext";

function NativeTabLayout() {
  const colors = useColors();
  const { isDark } = useTheme();
  
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <NativeTabs
        style={{
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        }}
        tabBarStyle={{
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        }}
      >
        <NativeTabs.Trigger name="index">
          <Icon sf={{ default: "heart", selected: "heart.fill" }} />
          <Label style={{ color: colors.foreground }}>Home</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="calendar">
          <Icon sf={{ default: "calendar", selected: "calendar" }} />
          <Label style={{ color: colors.foreground }}>Calendar</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="log">
          <Icon sf={{ default: "plus.circle", selected: "plus.circle.fill" }} />
          <Label style={{ color: colors.foreground }}>Log</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="insights">
          <Icon sf={{ default: "chart.bar.fill", selected: "chart.bar.fill" }} />
          <Label style={{ color: colors.foreground }}>Insights</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="profile">
          <Icon sf={{ default: "person", selected: "person.fill" }} />
          <Label style={{ color: colors.foreground }}>Profile</Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    </View>
  );
}

function ClassicTabLayout() {
  const colors = useColors();
  const { isDark } = useTheme();
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  // Force consistent theming by creating a stable style object
  const tabBarStyle = useMemo(() => ({
    position: "absolute" as const,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    elevation: 8,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: -2 },
    ...(isWeb ? { height: 84 } : {}),
  }), [colors.background, colors.border, isWeb]);

  const tabBarBackground = useCallback(() => (
    <View
      style={[
        StyleSheet.absoluteFill,
        { 
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
      ]}
    />
  ), [colors.background, colors.border]);

  // Create stable screen options to prevent re-rendering issues
  const screenOptions = useMemo(() => ({
    headerShown: false,
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.mutedForeground,
    tabBarStyle,
    tabBarBackground,
    tabBarHideOnKeyboard: false,
    tabBarAllowFontScaling: false,
  }), [colors.primary, colors.mutedForeground, tabBarStyle, tabBarBackground]);

  return (
    <Tabs
      screenOptions={screenOptions}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="heart" tintColor={color} size={24} />
            ) : (
              <Feather name="heart" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="calendar" tintColor={color} size={24} />
            ) : (
              <Feather name="calendar" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="log"
        options={{
          title: "Log",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="plus.circle" tintColor={color} size={24} />
            ) : (
              <Feather name="plus-circle" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: "Insights",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="chart.bar" tintColor={color} size={24} />
            ) : (
              <Feather name="bar-chart-2" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="person" tintColor={color} size={24} />
            ) : (
              <Feather name="user" size={22} color={color} />
            ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}
