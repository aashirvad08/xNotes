import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const FILTER_OPTIONS = [
  { key: "all", label: "All" },
  { key: "completed", label: "Completed" },
  { key: "pending", label: "Pending" },
];

export default function FilterTabs({ activeFilter, onChange }) {
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

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#161321",
    borderWidth: 1,
    borderColor: "#2B2540",
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
    backgroundColor: "#7E22CE",
  },
  label: {
    color: "#C4B5FD",
    fontSize: 14,
    fontWeight: "600",
  },
  activeLabel: {
    color: "#FFFFFF",
  },
});
