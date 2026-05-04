import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { Feather } from "@expo/vector-icons";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { router, Tabs } from "expo-router";
import { SymbolView } from "expo-symbols";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  View,
  useCallback,
  useMemo,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { CycleProvider, useCycle } from "@/context/CycleContext";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { UserProvider, useUser } from "@/context/UserContext";
import { useColors } from "@/hooks/useColors";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

// ── Branded loading screen ────────────────────────────────────────────────────

function LoadingScreen() {
  const colors = useColors();
  const native = Platform.OS !== "web";
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: native, tension: 60, friction: 8 }).start();
    const dot = (v: Animated.Value, delay: number) =>
      Animated.loop(Animated.sequence([
        Animated.delay(delay),
        Animated.timing(v, { toValue: 1, duration: 350, useNativeDriver: native }),
        Animated.timing(v, { toValue: 0, duration: 350, useNativeDriver: native }),
        Animated.delay(650 - delay),
      ]));
    Animated.parallel([dot(dot1, 0), dot(dot2, 200), dot(dot3, 400)]).start();
  }, []);

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }]}>
      <Animated.View style={{ alignItems: "center", transform: [{ scale }] }}>
        <Text style={{ fontSize: 72, marginBottom: 16 }}>🌸</Text>
        <Text style={{ fontSize: 36, fontWeight: "700", color: colors.foreground, letterSpacing: -1, marginBottom: 6 }}>Bloom</Text>
        <Text style={{ fontSize: 15, color: colors.mutedForeground, marginBottom: 40 }}>Your cycle companion</Text>
      </Animated.View>
      <View style={{ flexDirection: "row", gap: 8 }}>
        {[dot1, dot2, dot3].map((d, i) => (
          <Animated.View key={i} style={{
            width: 8, height: 8, borderRadius: 4,
            backgroundColor: colors.primary,
            opacity: d.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
            transform: [{ scale: d.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.2] }) }],
          }} />
        ))}
      </View>
    </View>
  );
}

// ── Tab navigator ─────────────────────────────────────────────────────────────

function AppTabs() {
  const colors = useColors();
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  const tabBarStyle = {
    position: "absolute" as const,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    elevation: 8,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: -2 },
    ...(isWeb ? { height: 84 } : {}),
  };

  const tabBarBackground = () => (
    <View style={[StyleSheet.absoluteFill, {
      backgroundColor: colors.background,
      borderTopColor: colors.border,
      borderTopWidth: 1,
    }]} />
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle,
        tabBarBackground,
        tabBarHideOnKeyboard: false,
        tabBarAllowFontScaling: false,
      }}
    >
      {/* Hidden screens — no tab item */}
      <Tabs.Screen name="onboarding" options={{ href: null, headerShown: false, tabBarStyle: { display: "none" } }} />
      <Tabs.Screen name="+not-found" options={{ href: null, tabBarStyle: { display: "none" } }} />

      {/* Tab screens */}
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

// ── Auth + loading guard ──────────────────────────────────────────────────────

function AppShell() {
  const { profile, loaded: userLoaded } = useUser();
  const { loaded: cycleLoaded } = useCycle();
  const { isDark } = useTheme();
  const allLoaded = userLoaded && cycleLoaded;

  useEffect(() => {
    if (!allLoaded) return;
    if (!profile?.hasCompletedOnboarding) {
      router.replace("/onboarding");
    }
  }, [allLoaded, profile]);

  return (
    <View style={{ flex: 1, position: "relative" }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <AppTabs />
      {!allLoaded && <LoadingScreen />}
    </View>
  );
}

// ── Root layout ───────────────────────────────────────────────────────────────

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

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
