import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { loginUser } from "../services/authService";
import { getToggleLabel } from "../theme";

export default function LoginScreen({ navigation, onLogin, theme, themeName, toggleTheme }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const styles = createStyles(theme);

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing details", "Enter your email and password to continue.");
      return;
    }

    try {
      setIsLoading(true);
      const user = await loginUser({
        email: email.trim(),
        password,
      });
      onLogin(user);
    } catch (error) {
      Alert.alert("Login failed", error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.topActions}>
          <Pressable style={styles.themeButton} onPress={toggleTheme}>
            <Text style={styles.themeButtonText}>{getToggleLabel(themeName)} Mode</Text>
          </Pressable>
        </View>

        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>Demo To-Do App</Text>
          <Text style={styles.title}>Welcome back</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="Enter your email"
            placeholderTextColor={theme.textMuted}
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            placeholder="Enter your password"
            placeholderTextColor={theme.textMuted}
            style={styles.input}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Pressable style={styles.button} onPress={handleLogin} disabled={isLoading}>
            <Text style={styles.buttonText}>{isLoading ? "Logging in..." : "Login"}</Text>
          </Pressable>

          <Pressable onPress={() => navigation.navigate("Register")}>
            <Text style={styles.footerText}>
              Don't have an account? <Text style={styles.link}>Create one</Text>
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.background,
    },
    container: {
      flex: 1,
      paddingHorizontal: 22,
      paddingVertical: 28,
      justifyContent: "center",
    },
    topActions: {
      position: "absolute",
      top: 12,
      right: 22,
      zIndex: 1,
    },
    themeButton: {
      backgroundColor: theme.surfaceStrong,
      borderWidth: 1,
      borderColor: theme.borderStrong,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 12,
    },
    themeButtonText: {
      color: theme.accentText,
      fontWeight: "700",
      fontSize: 13,
    },
    heroCard: {
      marginBottom: 18,
    },
    eyebrow: {
      color: theme.accentBright,
      textTransform: "uppercase",
      letterSpacing: 1.2,
      fontSize: 12,
      fontWeight: "700",
      marginBottom: 8,
    },
    title: {
      fontSize: 32,
      color: theme.textPrimary,
      fontWeight: "800",
      marginBottom: 10,
    },
    formCard: {
      backgroundColor: theme.surface,
      borderRadius: 24,
      padding: 20,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: theme.shadow,
      shadowOpacity: 0.28,
      shadowRadius: 16,
      shadowOffset: {
        width: 0,
        height: 8,
      },
      elevation: 6,
    },
    label: {
      color: theme.textSecondary,
      fontSize: 14,
      fontWeight: "700",
      marginBottom: 8,
      marginTop: 10,
    },
    input: {
      backgroundColor: theme.surfaceAlt,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.borderStrong,
      paddingHorizontal: 14,
      paddingVertical: 14,
      fontSize: 15,
      color: theme.textPrimary,
    },
    button: {
      backgroundColor: theme.accent,
      borderRadius: 14,
      alignItems: "center",
      paddingVertical: 15,
      marginTop: 22,
      marginBottom: 18,
    },
    buttonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "700",
    },
    footerText: {
      textAlign: "center",
      color: theme.textMuted,
      fontSize: 14,
    },
    link: {
      color: theme.accentSoft,
      fontWeight: "700",
    },
  });
}
