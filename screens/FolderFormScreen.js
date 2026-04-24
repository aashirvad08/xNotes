import React, { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { saveFolder } from "../services/folderService";
import { getToggleLabel, PRIORITY_COLORS } from "../theme";

const PRIORITY_OPTIONS = ["High", "Medium", "Low"];

function getFolderPriorityPreview(folder, tasks) {
  if (folder.priorityMode === "manual") {
    return folder.manualPriority;
  }

  const folderTasks = tasks.filter((task) => task.folderId === folder.id);

  if (folderTasks.length === 0) {
    return "Low";
  }

  const counts = { High: 0, Medium: 0, Low: 0 };

  folderTasks.forEach((task) => {
    counts[task.priority] = (counts[task.priority] || 0) + 1;
  });

  if (counts.High >= counts.Medium && counts.High >= counts.Low) {
    return "High";
  }

  if (counts.Medium >= counts.Low) {
    return "Medium";
  }

  return "Low";
}

function showError(title, message, error) {
  console.error(title, message, error);

  if (typeof window !== "undefined" && typeof window.alert === "function") {
    window.alert(`${title}: ${message}`);
    return;
  }

  Alert.alert(title, message);
}

export default function FolderFormScreen({
  navigation,
  route,
  user,
  tasks,
  theme,
  themeName,
  toggleTheme,
}) {
  const existingFolder = route.params?.folder;
  const styles = createStyles(theme);
  const [name, setName] = useState(existingFolder?.name || "");
  const [priorityMode, setPriorityMode] = useState(existingFolder?.priorityMode || "auto");
  const [manualPriority, setManualPriority] = useState(existingFolder?.manualPriority || "Medium");

  const previewPriority = useMemo(() => {
    return getFolderPriorityPreview(
      {
        id: existingFolder?.id || "preview-folder",
        priorityMode,
        manualPriority,
      },
      tasks
    );
  }, [existingFolder?.id, manualPriority, priorityMode, tasks]);

  async function handleSaveFolder() {
    if (!name.trim()) {
      Alert.alert("Missing details", "Please enter a folder name.");
      return;
    }

    const nextFolder = {
      id: existingFolder?.id,
      userId: user.uid,
      name: name.trim(),
      priorityMode,
      manualPriority,
    };

    try {
      await saveFolder(nextFolder);
      navigation.goBack();
    } catch (error) {
      showError("Save failed", error.message || "Unable to save folder.", error);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.headerRow}>
            <View style={styles.headerTextWrapper}>
              <Text style={styles.title}>{existingFolder ? "Edit folder" : "Create folder"}</Text>
              <Text style={styles.subtitle}>
                Choose whether the folder priority should be manual or based on the majority of
                task priorities inside it.
              </Text>
            </View>
            <View style={styles.headerActions}>
              <Pressable style={styles.themeButton} onPress={toggleTheme}>
                <Text style={styles.themeButtonText}>{getToggleLabel(themeName)} Mode</Text>
              </Pressable>
              <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
                <Text style={styles.backButtonText}>Back</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.label}>Folder name</Text>
            <TextInput
              placeholder="Example: Placement Prep"
              placeholderTextColor={theme.textMuted}
              style={styles.input}
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Priority mode</Text>
            <View style={styles.modeRow}>
              <Pressable
                style={[styles.modeOption, priorityMode === "auto" && styles.modeOptionSelected]}
                onPress={() => setPriorityMode("auto")}
              >
                <Text
                  style={[
                    styles.modeOptionText,
                    priorityMode === "auto" && styles.modeOptionTextSelected,
                  ]}
                >
                  AI
                </Text>
              </Pressable>
              <Pressable
                style={[styles.modeOption, priorityMode === "manual" && styles.modeOptionSelected]}
                onPress={() => setPriorityMode("manual")}
              >
                <Text
                  style={[
                    styles.modeOptionText,
                    priorityMode === "manual" && styles.modeOptionTextSelected,
                  ]}
                >
                  Manual
                </Text>
              </Pressable>
            </View>

            {priorityMode === "manual" && (
              <>
                <Text style={styles.label}>Manual folder priority</Text>
                <View style={styles.priorityRow}>
                  {PRIORITY_OPTIONS.map((option) => {
                    const isSelected = manualPriority === option;

                    return (
                      <Pressable
                        key={option}
                        style={[
                          styles.priorityOption,
                          isSelected && {
                            backgroundColor: PRIORITY_COLORS[option],
                            borderColor: PRIORITY_COLORS[option],
                          },
                        ]}
                        onPress={() => setManualPriority(option)}
                      >
                        <Text
                          style={[
                            styles.priorityOptionText,
                            isSelected && styles.priorityOptionTextSelected,
                          ]}
                        >
                          {option}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            )}

            <Text style={styles.label}>Folder priority preview</Text>
            <View
              style={[
                styles.previewCard,
                { backgroundColor: `${PRIORITY_COLORS[previewPriority]}20` },
              ]}
            >
              <Text style={[styles.previewPriority, { color: PRIORITY_COLORS[previewPriority] }]}>
                {previewPriority}
              </Text>
              <Text style={styles.previewNote}>
                In AI mode, the folder priority follows whichever task priority appears most inside
                that folder.
              </Text>
            </View>

            <Pressable style={styles.saveButton} onPress={handleSaveFolder}>
              <Text style={styles.saveButtonText}>
                {existingFolder ? "Update Folder" : "Create Folder"}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
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
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingVertical: 20,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 18,
    },
    headerTextWrapper: {
      flex: 1,
      paddingRight: 12,
    },
    headerActions: {
      alignItems: "flex-end",
      gap: 10,
    },
    title: {
      color: theme.textPrimary,
      fontSize: 30,
      fontWeight: "800",
      marginBottom: 8,
    },
    subtitle: {
      color: theme.textMuted,
      fontSize: 15,
      lineHeight: 22,
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
    backButton: {
      backgroundColor: theme.surfaceStrong,
      borderWidth: 1,
      borderColor: theme.borderStrong,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 12,
    },
    backButtonText: {
      color: theme.accentText,
      fontWeight: "700",
    },
    formCard: {
      backgroundColor: theme.surface,
      borderRadius: 24,
      padding: 20,
      borderWidth: 1,
      borderColor: theme.border,
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
    modeRow: {
      flexDirection: "row",
      gap: 10,
    },
    modeOption: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.borderStrong,
      paddingVertical: 14,
      backgroundColor: theme.surfaceAlt,
    },
    modeOptionSelected: {
      backgroundColor: theme.accent,
      borderColor: theme.accent,
    },
    modeOptionText: {
      color: theme.textSecondary,
      fontWeight: "700",
    },
    modeOptionTextSelected: {
      color: "#FFFFFF",
    },
    priorityRow: {
      flexDirection: "row",
      gap: 10,
    },
    priorityOption: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.borderStrong,
      paddingVertical: 14,
      backgroundColor: theme.surfaceAlt,
    },
    priorityOptionText: {
      color: theme.textSecondary,
      fontWeight: "700",
    },
    priorityOptionTextSelected: {
      color: "#FFFFFF",
    },
    previewCard: {
      borderRadius: 16,
      padding: 16,
    },
    previewPriority: {
      fontSize: 18,
      fontWeight: "800",
      marginBottom: 6,
    },
    previewNote: {
      color: theme.textSoft,
      lineHeight: 20,
    },
    saveButton: {
      backgroundColor: theme.accent,
      borderRadius: 14,
      alignItems: "center",
      paddingVertical: 15,
      marginTop: 24,
    },
    saveButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "700",
    },
  });
}
