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

const PRIORITY_OPTIONS = ["High", "Medium", "Low"];
const PRIORITY_COLORS = {
  High: "#DC2626",
  Medium: "#D97706",
  Low: "#15803D",
};

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

export default function FolderFormScreen({ navigation, route, user, tasks }) {
  const existingFolder = route.params?.folder;
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
            <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
              <Text style={styles.backButtonText}>Back</Text>
            </Pressable>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.label}>Folder name</Text>
            <TextInput
              placeholder="Example: Placement Prep"
              placeholderTextColor="#94A3B8"
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#09090F",
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
  title: {
    color: "#F5F3FF",
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 8,
  },
  subtitle: {
    color: "#A1A1AA",
    fontSize: 15,
    lineHeight: 22,
  },
  backButton: {
    backgroundColor: "#1B1529",
    borderWidth: 1,
    borderColor: "#34274E",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  backButtonText: {
    color: "#E9D5FF",
    fontWeight: "700",
  },
  formCard: {
    backgroundColor: "#161321",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#2B2540",
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
    borderColor: "#34274E",
    paddingVertical: 14,
    backgroundColor: "#120F1B",
  },
  modeOptionSelected: {
    backgroundColor: "#7E22CE",
    borderColor: "#7E22CE",
  },
  modeOptionText: {
    color: "#DDD6FE",
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
    borderColor: "#34274E",
    paddingVertical: 14,
    backgroundColor: "#120F1B",
  },
  priorityOptionText: {
    color: "#DDD6FE",
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
    color: "#B3AEC2",
    lineHeight: 20,
  },
  saveButton: {
    backgroundColor: "#7E22CE",
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
