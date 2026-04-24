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
import { registerUser } from "../services/authService";

export default function RegisterScreen({ navigation, onRegister }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleRegister() {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Missing details", "Fill your name, email, and password to continue.");
      return;
    }

    try {
      setIsLoading(true);
      const user = await registerUser({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      onRegister(user);
    } catch (error) {
      Alert.alert("Registration failed", error.message);
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
          <Text style={styles.eyebrow}>Quick Demo Signup</Text>
          <Text style={styles.title}>Create your demo account</Text>
          <Text style={styles.subtitle}>
            No backend needed. Enter any details and jump straight into the app.
          </Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            placeholder="Enter your name"
            placeholderTextColor="#94A3B8"
            style={styles.input}
            value={name}
            onChangeText={setName}
          />

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

          <Pressable style={styles.button} onPress={handleRegister} disabled={isLoading}>
            <Text style={styles.buttonText}>{isLoading ? "Registering..." : "Register"}</Text>
          </Pressable>

          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.footerText}>
              Already have an account? <Text style={styles.link}>Login</Text>
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
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "#A1A1AA",
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
