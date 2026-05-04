import React from "react";
import { Text, View } from "react-native";
import { useUser } from "@/context/UserContext";
import { useColors } from "@/hooks/useColors";

export function Greeting() {
  const { profile } = useUser();
  const colors = useColors();
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  if (!profile) return null;

  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", color: colors.foreground }}>
        {getGreeting()}, {profile.firstName}!
      </Text>
    </View>
  );
}
