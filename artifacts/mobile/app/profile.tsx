import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useUser } from "@/context/UserContext";
import { useCycle } from "@/context/CycleContext";
import { useTheme } from "@/context/ThemeContext";
import { useColors } from "@/hooks/useColors";

export default function ProfileScreen() {
  const { profile, updateProfile, clearUserData } = useUser();
  const { clearAllData } = useCycle();
  const { themeMode, isDark, setThemeMode } = useTheme();
  const colors = useColors();
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(profile?.firstName || "");

  const handleSaveName = async () => {
    if (!tempName.trim()) {
      Alert.alert("Error", "Name cannot be empty");
      return;
    }
    
    try {
      await updateProfile({ firstName: tempName.trim() });
      setIsEditingName(false);
    } catch (error) {
      Alert.alert("Error", "Failed to update name");
    }
  };

  const handleCancelEdit = () => {
    setTempName(profile?.firstName || "");
    setIsEditingName(false);
  };

  const handleClearData = () => {
    Alert.alert(
      "Clear All Data",
      "This will permanently delete all your cycle data, logs, and profile information. This action cannot be undone. Are you sure?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear Data",
          style: "destructive",
          onPress: async () => {
            try {
              await clearAllData();
              await clearUserData();
              Alert.alert("Success", "All data has been cleared. The app will now restart.");
              // In a real app, you might want to restart the app or navigate to onboarding
            } catch (error) {
              Alert.alert("Error", "Failed to clear data. Please try again.");
            }
          },
        },
      ]
    );
  };

  const themeOptions = [
    { value: "light" as const, label: "Light", icon: "sun" },
    { value: "dark" as const, label: "Dark", icon: "moon" },
  ];

  
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 80 }}>
        {/* Header */}
        <View style={{ marginBottom: 32 }}>
          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center", marginBottom: 24 }}
            onPress={() => router.back()}
          >
            <Feather name="chevron-left" size={24} color={colors.foreground} />
            <Text style={{ fontSize: 18, color: colors.foreground, marginLeft: 8 }}>Back</Text>
          </TouchableOpacity>
          
          <Text style={{ fontSize: 32, fontWeight: "bold", color: colors.foreground, marginBottom: 8 }}>
            Profile
          </Text>
          <Text style={{ fontSize: 16, color: colors.mutedForeground }}>
            Manage your account and preferences
          </Text>
        </View>

        {/* Profile Info Card */}
        <View style={{ 
          backgroundColor: colors.card, 
          borderRadius: 16, 
          padding: 24, 
          marginBottom: 24,
          borderWidth: 1,
          borderColor: colors.border
        }}>
          <Text style={{ fontSize: 18, fontWeight: "600", color: colors.foreground, marginBottom: 16 }}>
            Personal Information
          </Text>
          
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, color: colors.mutedForeground, marginBottom: 8 }}>
              Name
            </Text>
            {isEditingName ? (
              <View style={{ flexDirection: "row", gap: 12 }}>
                <TextInput
                  style={{
                    flex: 1,
                    backgroundColor: colors.input,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    fontSize: 16,
                    color: colors.foreground,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                  value={tempName}
                  onChangeText={setTempName}
                  placeholder="Enter your name"
                  placeholderTextColor={colors.mutedForeground}
                />
                <TouchableOpacity
                  style={{ 
                    backgroundColor: colors.primary, 
                    paddingHorizontal: 16, 
                    paddingVertical: 8, 
                    borderRadius: 8 
                  }}
                  onPress={handleSaveName}
                >
                  <Feather name="check" size={16} color={colors.primaryForeground} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ 
                    backgroundColor: colors.secondary, 
                    paddingHorizontal: 16, 
                    paddingVertical: 8, 
                    borderRadius: 8 
                  }}
                  onPress={handleCancelEdit}
                >
                  <Feather name="x" size={16} color={colors.foreground} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontSize: 16, color: colors.foreground }}>
                  {profile?.firstName || "No name set"}
                </Text>
                <TouchableOpacity
                  style={{ 
                    backgroundColor: colors.secondary, 
                    paddingHorizontal: 12, 
                    paddingVertical: 6, 
                    borderRadius: 8 
                  }}
                  onPress={() => {
                    setTempName(profile?.firstName || "");
                    setIsEditingName(true);
                  }}
                >
                  <Feather name="edit-2" size={16} color={colors.foreground} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Theme Settings */}
        <View style={{ 
          backgroundColor: colors.card, 
          borderRadius: 16, 
          padding: 24, 
          marginBottom: 24,
          borderWidth: 1,
          borderColor: colors.border
        }}>
          <Text style={{ fontSize: 18, fontWeight: "600", color: colors.foreground, marginBottom: 16 }}>
            Appearance
          </Text>
          
          <Text style={{ fontSize: 14, color: colors.mutedForeground, marginBottom: 12 }}>
            Theme
          </Text>
          
          <View style={{ gap: 8 }}>
            {themeOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 12,
                  borderRadius: 8,
                  backgroundColor: themeMode === option.value ? colors.primary + "20" : "transparent",
                  borderWidth: 1,
                  borderColor: themeMode === option.value ? colors.primary : colors.border,
                }}
                onPress={() => setThemeMode(option.value)}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <Feather 
                    name={option.icon as any} 
                    size={18} 
                    color={themeMode === option.value ? colors.primary : colors.foreground} 
                  />
                  <Text style={{ 
                    fontSize: 16, 
                    color: themeMode === option.value ? colors.primary : colors.foreground 
                  }}>
                    {option.label}
                  </Text>
                </View>
                {themeMode === option.value && (
                  <Feather name="check" size={16} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Data Management */}
        <View style={{ 
          backgroundColor: colors.card, 
          borderRadius: 16, 
          padding: 24, 
          borderWidth: 1,
          borderColor: colors.border
        }}>
          <Text style={{ fontSize: 18, fontWeight: "600", color: colors.foreground, marginBottom: 16 }}>
            Data Management
          </Text>
          
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 16,
              backgroundColor: "#FF3B30" + "20",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#FF3B30",
            }}
            onPress={handleClearData}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Feather name="trash-2" size={18} color="#FF3B30" />
              <Text style={{ fontSize: 16, color: "#FF3B30", fontWeight: "600" }}>
                Clear All Data
              </Text>
            </View>
            <Feather name="chevron-right" size={16} color="#FF3B30" />
          </TouchableOpacity>
          
          <Text style={{ fontSize: 12, color: colors.mutedForeground, marginTop: 8, fontStyle: "italic" }}>
            This will permanently delete all your cycles, logs, and profile data
          </Text>
        </View>

        {/* App Info */}
        <View style={{ 
          backgroundColor: colors.card, 
          borderRadius: 16, 
          padding: 24, 
          borderWidth: 1,
          borderColor: colors.border
        }}>
          <Text style={{ fontSize: 18, fontWeight: "600", color: colors.foreground, marginBottom: 16 }}>
            About
          </Text>
          
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 14, color: colors.mutedForeground }}>Version</Text>
              <Text style={{ fontSize: 14, color: colors.foreground }}>1.0.0</Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 14, color: colors.mutedForeground }}>App</Text>
              <Text style={{ fontSize: 14, color: colors.foreground }}>Bloom</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
