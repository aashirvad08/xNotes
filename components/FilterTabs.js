import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const FILTER_OPTIONS = [
  { key: "all", label: "All" },
  { key: "completed", label: "Completed" },
  { key: "pending", label: "Pending" },
];

export default function FilterTabs({ activeFilter, onChange, theme }) {
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      {FILTER_OPTIONS.map((option) => {
        const isActive = activeFilter === option.key;

        return (
          <Pressable
            key={option.key}
            style={[styles.tab, isActive && styles.activeTab]}
            onPress={() => onChange(option.key)}
          >
            <Text style={[styles.label, isActive && styles.activeLabel]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    container: {
      flexDirection: "row",
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 18,
      padding: 6,
      marginBottom: 16,
    },
    tab: {
      flex: 1,
      alignItems: "center",
      paddingVertical: 12,
      borderRadius: 14,
    },
    activeTab: {
      backgroundColor: theme.accent,
    },
    label: {
      color: theme.accentText,
      fontSize: 14,
      fontWeight: "600",
    },
    activeLabel: {
      color: "#FFFFFF",
    },
  });
}
