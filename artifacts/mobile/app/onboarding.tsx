import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Feather } from "@expo/vector-icons";
import React, { useState, useRef } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useUser } from "@/context/UserContext";
import { useColors } from "@/hooks/useColors";
import { useTheme } from "@/context/ThemeContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const STEPS = [
  {
    emoji: "🌸",
    title: "Welcome to Bloom",
    subtitle: "Your personal cycle companion, designed around your privacy and wellbeing.",
  },
  {
    emoji: "🔒",
    title: "Privacy first",
    subtitle: "All your data stays on your device. No accounts, no cloud, no ads — ever.",
  },
  {
    emoji: "📊",
    title: "Understand your body",
    subtitle: "Track your period, mood, and symptoms to uncover your personal patterns.",
  },
];

export default function OnboardingScreen() {
  const { completeOnboarding } = useUser();
  const { isDark } = useTheme();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [firstName, setFirstName] = useState("");
  const [nameError, setNameError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const isLastInfoStep = step === STEPS.length - 1;
  const isNameStep = step === STEPS.length;
  const totalDots = STEPS.length + 1;

  const native = Platform.OS !== "web";
  const animateNext = (nextStep: number) => {
    Animated.sequence([
      Animated.timing(slideAnim, { toValue: -30, duration: 120, useNativeDriver: native }),
      Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: native }),
    ]).start();
    setStep(nextStep);
  };

  const handleNext = () => {
    if (isLastInfoStep) {
      animateNext(STEPS.length);
    } else {
      animateNext(step + 1);
    }
  };

  const handleSubmit = async () => {
    const trimmed = firstName.trim();
    if (!trimmed) {
      setNameError("Please enter your name");
      return;
    }
    if (trimmed.length > 50) {
      setNameError("Name is too long");
      return;
    }
    setNameError("");
    setIsSubmitting(true);
    try {
      await completeOnboarding({ firstName: trimmed });
      router.replace("/(tabs)");
    } catch {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: topPad + 24,
          paddingBottom: bottomPad + 24,
          paddingHorizontal: 32,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Dot progress */}
        <View style={{ flexDirection: "row", gap: 6, marginBottom: 48, justifyContent: "center" }}>
          {Array.from({ length: totalDots }).map((_, i) => (
            <View
              key={i}
              style={{
                height: 6,
                width: i === step ? 24 : 6,
                borderRadius: 3,
                backgroundColor: i === step ? colors.primary : colors.border,
              }}
            />
          ))}
        </View>

        {/* Content area */}
        <Animated.View
          style={{
            flex: 1,
            alignItems: "center",
            opacity: slideAnim.interpolate({ inputRange: [-30, 0], outputRange: [0.4, 1] }),
            transform: [{ translateX: slideAnim }],
          }}
        >
          {!isNameStep ? (
            <>
              {/* Info step */}
              <Text style={{ fontSize: 80, marginBottom: 32, textAlign: "center" }}>
                {STEPS[step].emoji}
              </Text>
              <Text style={{
                fontSize: 30,
                fontWeight: "700",
                color: colors.foreground,
                textAlign: "center",
                marginBottom: 16,
                letterSpacing: -0.5,
                lineHeight: 36,
              }}>
                {STEPS[step].title}
              </Text>
              <Text style={{
                fontSize: 17,
                color: colors.mutedForeground,
                textAlign: "center",
                lineHeight: 26,
                maxWidth: 300,
              }}>
                {STEPS[step].subtitle}
              </Text>

              {/* Feature bullets on last info step */}
              {isLastInfoStep && (
                <View style={{ marginTop: 32, gap: 16, width: "100%" }}>
                  {[
                    { icon: "droplet", text: "Period & flow tracking" },
                    { icon: "smile", text: "Mood & symptom logging" },
                    { icon: "bar-chart-2", text: "Cycle insights & predictions" },
                  ].map(({ icon, text }) => (
                    <View key={text} style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 14,
                      backgroundColor: colors.card,
                      borderRadius: 14,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}>
                      <View style={{
                        width: 38,
                        height: 38,
                        borderRadius: 10,
                        backgroundColor: colors.primary + "20",
                        alignItems: "center",
                        justifyContent: "center",
                      }}>
                        <Feather name={icon as any} size={18} color={colors.primary} />
                      </View>
                      <Text style={{ fontSize: 15, color: colors.foreground, fontWeight: "500" }}>
                        {text}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </>
          ) : (
            <>
              {/* Name step */}
              <Text style={{ fontSize: 64, marginBottom: 24, textAlign: "center" }}>👋</Text>
              <Text style={{
                fontSize: 30,
                fontWeight: "700",
                color: colors.foreground,
                textAlign: "center",
                marginBottom: 10,
                letterSpacing: -0.5,
              }}>
                What's your name?
              </Text>
              <Text style={{
                fontSize: 16,
                color: colors.mutedForeground,
                textAlign: "center",
                marginBottom: 36,
                lineHeight: 24,
              }}>
                We'll use this to personalise your experience.
              </Text>

              <View style={{ width: "100%" }}>
                <TextInput
                  style={{
                    backgroundColor: colors.card,
                    borderRadius: 16,
                    paddingHorizontal: 20,
                    paddingVertical: 18,
                    borderWidth: 2,
                    borderColor: nameError ? colors.destructive : firstName ? colors.primary : colors.border,
                    fontSize: 18,
                    color: colors.foreground,
                    width: "100%",
                  }}
                  placeholder="Your first name"
                  placeholderTextColor={colors.mutedForeground}
                  value={firstName}
                  onChangeText={(t) => { setFirstName(t); setNameError(""); }}
                  autoFocus
                  autoCapitalize="words"
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                />
                {nameError ? (
                  <Text style={{ color: colors.destructive, fontSize: 13, marginTop: 8, marginLeft: 4 }}>
                    {nameError}
                  </Text>
                ) : null}
              </View>
            </>
          )}
        </Animated.View>

        {/* Bottom button */}
        <View style={{ marginTop: 40 }}>
          <TouchableOpacity
            onPress={isNameStep ? handleSubmit : handleNext}
            disabled={isSubmitting}
            activeOpacity={0.85}
            style={{
              backgroundColor: colors.primary,
              borderRadius: 18,
              paddingVertical: 18,
              alignItems: "center",
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.25,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            <Text style={{
              color: colors.primaryForeground,
              fontSize: 17,
              fontWeight: "700",
              letterSpacing: 0.2,
            }}>
              {isNameStep
                ? (isSubmitting ? "Setting up..." : "Get started")
                : isLastInfoStep
                ? "Continue"
                : "Next"}
            </Text>
          </TouchableOpacity>

          {/* Skip on non-name steps */}
          {!isNameStep && (
            <TouchableOpacity
              onPress={() => animateNext(STEPS.length)}
              style={{ alignItems: "center", paddingVertical: 14 }}
              activeOpacity={0.7}
            >
              <Text style={{ color: colors.mutedForeground, fontSize: 15 }}>
                Skip intro
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
