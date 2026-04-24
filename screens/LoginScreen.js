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

export default function LoginScreen({ navigation, onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>Demo To-Do App</Text>
          <Text style={styles.title}>Welcome back</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="Enter your email"
            placeholderTextColor="#94A3B8"
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            placeholder="Enter your password"
            placeholderTextColor="#94A3B8"
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#09090F",
  },
  container: {
    flex: 1,
    paddingHorizontal: 22,
    paddingVertical: 28,
    justifyContent: "center",
  },
  heroCard: {
    marginBottom: 18,
  },
  eyebrow: {
    color: "#A855F7",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    color: "#F5F3FF",
    fontWeight: "800",
    marginBottom: 10,
  },
  formCard: {
    backgroundColor: "#161321",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#2B2540",
    shadowColor: "#000000",
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 6,
  },
  label: {
    color: "#DDD6FE",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#0F0B17",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#31284B",
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: "#F5F3FF",
  },
  button: {
    backgroundColor: "#7E22CE",
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
    color: "#A1A1AA",
    fontSize: 14,
  },
  link: {
    color: "#C084FC",
    fontWeight: "700",
  },
});
