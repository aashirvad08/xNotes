import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";

export default function FloatingActionButton({ onPress, theme }) {
  const styles = createStyles(theme);

  return (
    <Pressable style={styles.button} onPress={onPress}>
      <Text style={styles.icon}>+</Text>
    </Pressable>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    button: {
      position: "absolute",
      right: 24,
      bottom: 28,
      width: 62,
      height: 62,
      borderRadius: 31,
      backgroundColor: theme.accent,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: theme.fabShadow,
      shadowOpacity: 0.3,
      shadowRadius: 14,
      shadowOffset: {
        width: 0,
        height: 8,
      },
      elevation: 6,
    },
    icon: {
      color: "#FFFFFF",
      fontSize: 32,
      lineHeight: 34,
      fontWeight: "700",
      marginTop: -2,
    },
  });
}
