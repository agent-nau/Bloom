import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { router, Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { Feather } from "@expo/vector-icons";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { CycleProvider, useCycle } from "@/context/CycleContext";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { UserProvider, useUser } from "@/context/UserContext";
import { useColors } from "@/hooks/useColors";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

// ── Loading screen ──────────────────────────────────────────────────────────

function LoadingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const native = Platform.OS !== "web";

  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.spring(logoScale, { toValue: 1, useNativeDriver: native, tension: 60, friction: 8 }).start();

    const makeDot = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 350, useNativeDriver: native }),
          Animated.timing(dot, { toValue: 0, duration: 350, useNativeDriver: native }),
          Animated.delay(650 - delay),
        ])
      );

    Animated.parallel([makeDot(dot1, 0), makeDot(dot2, 200), makeDot(dot3, 400)]).start();
  }, []);

  return (
    <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }}>
      <Animated.View style={{ alignItems: "center", transform: [{ scale: logoScale }] }}>
        <Text style={{ fontSize: 72, marginBottom: 16 }}>🌸</Text>
        <Text style={{ fontSize: 36, fontWeight: "700", color: colors.foreground, letterSpacing: -1, marginBottom: 6 }}>
          Bloom
        </Text>
        <Text style={{ fontSize: 15, color: colors.mutedForeground, marginBottom: 40 }}>
          Your cycle companion
        </Text>
      </Animated.View>
      <View style={{ flexDirection: "row", gap: 8 }}>
        {[dot1, dot2, dot3].map((dot, i) => (
          <Animated.View
            key={i}
            style={{
              width: 8, height: 8, borderRadius: 4,
              backgroundColor: colors.primary,
              opacity: dot.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
              transform: [{ scale: dot.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.2] }) }],
            }}
          />
        ))}
      </View>
    </View>
  );
}

// ── Tab layouts ─────────────────────────────────────────────────────────────

function NativeTabLayout() {
  const colors = useColors();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <NativeTabs
        style={{ backgroundColor: colors.background, borderTopColor: colors.border }}
        tabBarStyle={{ backgroundColor: colors.background, borderTopColor: colors.border }}
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
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

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
    <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background, borderTopColor: colors.border, borderTopWidth: 1 }]} />
  ), [colors.background, colors.border]);

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
    <Tabs screenOptions={screenOptions}>
      <Tabs.Screen name="onboarding" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="+not-found" options={{ href: null }} />
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => isIOS
            ? <SymbolView name="heart" tintColor={color} size={24} />
            : <Feather name="heart" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          tabBarIcon: ({ color }) => isIOS
            ? <SymbolView name="calendar" tintColor={color} size={24} />
            : <Feather name="calendar" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="log"
        options={{
          title: "Log",
          tabBarIcon: ({ color }) => isIOS
            ? <SymbolView name="plus.circle" tintColor={color} size={24} />
            : <Feather name="plus-circle" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: "Insights",
          tabBarIcon: ({ color }) => isIOS
            ? <SymbolView name="chart.bar" tintColor={color} size={24} />
            : <Feather name="bar-chart-2" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => isIOS
            ? <SymbolView name="person" tintColor={color} size={24} />
            : <Feather name="user" size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}

// ── Auth + loading guard ─────────────────────────────────────────────────────

function AppShell() {
  const { profile, loaded: userLoaded } = useUser();
  const { loaded: cycleLoaded } = useCycle();
  const { isDark } = useTheme();
  const allLoaded = userLoaded && cycleLoaded;

  useEffect(() => {
    if (!allLoaded) return;
    SplashScreen.hideAsync();
    if (!profile?.hasCompletedOnboarding) {
      router.replace("/onboarding");
    }
  }, [allLoaded, profile]);

  const tabLayout = isLiquidGlassAvailable() ? <NativeTabLayout /> : <ClassicTabLayout />;

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      {tabLayout}
      {!allLoaded && <LoadingScreen />}
    </View>
  );
}

// ── Root layout ──────────────────────────────────────────────────────────────

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ErrorBoundary>
          <UserProvider>
            <QueryClientProvider client={queryClient}>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <KeyboardProvider>
                  <CycleProvider>
                    <AppShell />
                  </CycleProvider>
                </KeyboardProvider>
              </GestureHandlerRootView>
            </QueryClientProvider>
          </UserProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
