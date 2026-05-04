import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useUser } from "@/context/UserContext";
import { useColors } from "@/hooks/useColors";

export default function OnboardingScreen() {
  const { completeOnboarding } = useUser();
  const colors = useColors();
  const [firstName, setFirstName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (firstName.length > 50) {
      newErrors.firstName = "Name too long";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      await completeOnboarding({ firstName });
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert("Error", "Failed to save your information. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="dark" />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 80 }}>
        <View style={{ marginBottom: 48 }}>
          <Text style={{ fontSize: 32, fontWeight: "bold", color: colors.foreground, marginBottom: 16 }}>
            Welcome to Bloom
          </Text>
          <Text style={{ fontSize: 18, color: colors.mutedForeground, lineHeight: 24 }}>
            Your personal cycle tracking companion. Let's get to know you better.
          </Text>
        </View>

        <View style={{ gap: 32 }}>
          <View>
            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 12 }}>
              First Name
            </Text>
            <TextInput
              style={{
                backgroundColor: colors.card,
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 16,
                borderWidth: 1,
                borderColor: colors.border,
                fontSize: 18,
                color: colors.foreground
              }}
              placeholder="Enter your first name"
              placeholderTextColor={colors.mutedForeground}
              value={firstName}
              onChangeText={setFirstName}
            />
            {errors.firstName && (
              <Text style={{ color: colors.destructive, fontSize: 14, marginTop: 8 }}>
                {errors.firstName}
              </Text>
            )}
          </View>

          </View>

        <View style={{ marginTop: 48, marginBottom: 32 }}>
          <TouchableOpacity
            onPress={onSubmit}
            disabled={isSubmitting}
            style={{
              backgroundColor: colors.primary,
              borderRadius: 16,
              paddingVertical: 16,
              alignItems: "center",
              marginTop: 48,
              marginBottom: 32
            }}
          >
            <Text style={{ color: colors.primaryForeground, fontSize: 18, fontWeight: "600" }}>
              {isSubmitting ? "Saving..." : "Continue"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
