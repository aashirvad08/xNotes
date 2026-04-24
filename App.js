import "react-native-gesture-handler";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { onAuthStateChanged } from "firebase/auth";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import HomeScreen from "./screens/HomeScreen";
import AddTaskScreen from "./screens/AddTaskScreen";
import FolderFormScreen from "./screens/FolderFormScreen";
import { auth } from "./services/firebase";
import { subscribeToTasks } from "./services/taskService";
import { subscribeToFolders } from "./services/folderService";
import { THEMES } from "./theme";

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [folders, setFolders] = useState([]);
  const [themeName, setThemeName] = useState("dark");

  const theme = THEMES[themeName];

  function toggleTheme() {
    setThemeName((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsCheckingSession(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) {
      setTasks([]);
      setFolders([]);
      return undefined;
    }

    const unsubscribeTasks = subscribeToTasks(
      user.uid,
      setTasks,
      (error) => Alert.alert("Task load failed", error.message)
    );

    const unsubscribeFolders = subscribeToFolders(
      user.uid,
      setFolders,
      (error) => Alert.alert("Folder load failed", error.message)
    );

    return () => {
      unsubscribeTasks();
      unsubscribeFolders();
    };
  }, [user]);

  if (isCheckingSession) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: theme.background }]}>
        <StatusBar style={theme.statusBar} />
        <ActivityIndicator size="large" color="#A855F7" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style={theme.statusBar} />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Home">
              {(props) => (
                <HomeScreen
                  {...props}
                  user={user}
                  tasks={tasks}
                  folders={folders}
                  theme={theme}
                  themeName={themeName}
                  toggleTheme={toggleTheme}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="AddTask">
              {(props) => (
                <AddTaskScreen
                  {...props}
                  user={user}
                  folders={folders}
                  theme={theme}
                  themeName={themeName}
                  toggleTheme={toggleTheme}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="FolderForm">
              {(props) => (
                <FolderFormScreen
                  {...props}
                  user={user}
                  tasks={tasks}
                  theme={theme}
                  themeName={themeName}
                  toggleTheme={toggleTheme}
                />
              )}
            </Stack.Screen>
          </>
        ) : (
          <>
            <Stack.Screen name="Login">
              {(props) => (
                <LoginScreen
                  {...props}
                  onLogin={(nextUser) => setUser(nextUser)}
                  theme={theme}
                  themeName={themeName}
                  toggleTheme={toggleTheme}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Register">
              {(props) => (
                <RegisterScreen
                  {...props}
                  onRegister={(nextUser) => setUser(nextUser)}
                  theme={theme}
                  themeName={themeName}
                  toggleTheme={toggleTheme}
                />
              )}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#09090F",
  },
});
