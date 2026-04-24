import React, { useEffect, useMemo, useState } from "react";
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
import { saveTask } from "../services/taskService";
import { getToggleLabel, PRIORITY_COLORS } from "../theme";

const PRIORITY_OPTIONS = ["High", "Medium", "Low"];

const HIGH_PRIORITY_KEYWORDS = [
  "exam",
  "deadline",
  "submit",
  "submission",
  "urgent",
  "asap",
  "important",
  "critical",
  "interview",
  "offer",
  "joining",
  "onboarding",
  "presentation",
  "client",
  "production",
  "prod",
  "deploy",
  "deployment",
  "release",
  "hotfix",
  "fix",
  "bug",
  "issue",
  "error",
  "failure",
  "incident",
  "outage",
  "payment",
  "invoice",
  "tax",
  "salary",
  "rent",
  "emi",
  "bill",
  "medical",
  "doctor",
  "hospital",
  "surgery",
  "medicine",
  "passport",
  "visa",
  "court",
  "police",
  "complaint",
  "compliance",
  "audit",
  "security",
  "breach",
  "password",
  "evaluation",
  "quiz",
  "test",
  "viva",
  "practical",
  "assignment",
  "midterm",
  "final",
  "board exam",
  "entrance",
  "admission",
  "scholarship",
  "application",
  "approval",
  "renewal",
  "registration",
  "booking",
  "reservation",
  "flight",
  "train",
  "departure",
  "arrival",
  "wedding",
  "ceremony",
  "event",
  "launch",
  "demo",
  "review deadline",
  "delivery",
  "dispatch",
  "shipment",
  "refund",
  "payment due",
  "bank",
  "loan",
  "interview prep",
  "portfolio",
  "resume",
  "cv",
  "job",
  "offer letter",
  "code red",
  "priority",
];

const MEDIUM_PRIORITY_KEYWORDS = [
  "meeting",
  "project",
  "work",
  "review",
  "prepare",
  "study",
  "research",
  "plan",
  "discussion",
  "team",
  "update",
  "code",
  "development",
  "feature",
  "progress",
  "task",
  "build",
  "design",
  "implement",
  "analyze",
  "sync",
  "call",
  "lecture",
  "class",
  "practice",
  "revision",
  "notes",
  "documentation",
  "doc",
  "read",
  "learn",
  "tutorial",
  "training",
  "workshop",
  "session",
  "brainstorm",
  "planning",
  "roadmap",
  "testing",
  "qa",
  "debug",
  "refactor",
  "cleanup",
  "optimize",
  "integration",
  "setup",
  "configuration",
  "config",
  "organize",
  "arrange",
  "follow up",
  "follow-up",
  "feedback",
  "check",
  "verify",
  "monitor",
  "track",
  "report",
  "summary",
  "schedule",
  "appointment",
  "shopping",
  "purchase",
  "buy",
  "order",
  "maintenance",
  "repair",
  "service",
  "backup",
  "upload",
  "download",
  "content",
  "post",
  "email",
  "message",
  "reply",
  "respond",
  "draft",
  "meeting notes",
  "assignment draft",
  "mock interview",
  "practice test",
  "grocery",
  "groceries",
  "budget",
];

const LOW_PRIORITY_KEYWORDS = [
  "watch",
  "movie",
  "series",
  "music",
  "song",
  "game",
  "gaming",
  "walk",
  "jog",
  "yoga",
  "exercise",
  "gym",
  "meditate",
  "meditation",
  "clean",
  "room",
  "desk",
  "closet",
  "laundry",
  "water plants",
  "plant",
  "decorate",
  "browse",
  "explore",
  "wishlist",
  "hobby",
  "sketch",
  "drawing",
  "paint",
  "reading",
  "novel",
  "podcast",
  "relax",
  "rest",
  "nap",
  "self care",
  "self-care",
  "coffee",
  "tea",
  "snack",
  "cook",
  "recipe",
  "garden",
  "shopping list",
  "photography",
  "practice guitar",
  "practice piano",
];

function getKeywordScore(title, keywords, weight) {
  return keywords.reduce((score, keyword) => {
    return title.includes(keyword) ? score + weight : score;
  }, 0);
}

function getPriority(title) {
  const normalizedTitle = title.toLowerCase().trim();

  if (!normalizedTitle) {
    return "Low";
  }

  const highScore = getKeywordScore(normalizedTitle, HIGH_PRIORITY_KEYWORDS, 3);
  const mediumScore = getKeywordScore(normalizedTitle, MEDIUM_PRIORITY_KEYWORDS, 2);
  const lowScore = getKeywordScore(normalizedTitle, LOW_PRIORITY_KEYWORDS, 1);

  if (highScore >= 3 || (highScore > 0 && mediumScore > 0)) {
    return "High";
  }

  if (mediumScore >= 2 || highScore > lowScore) {
    return "Medium";
  }

  if (lowScore > 0) {
    return "Low";
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

export default function AddTaskScreen({
  navigation,
  route,
  user,
  folders,
  theme,
  themeName,
  toggleTheme,
}) {
  const existingTask = route.params?.task;
  const styles = createStyles(theme);
  const [title, setTitle] = useState(existingTask?.title || "");
  const [description, setDescription] = useState(existingTask?.description || "");
  const [selectedFolderId, setSelectedFolderId] = useState(existingTask?.folderId || "");
  const [selectedPriority, setSelectedPriority] = useState(
    existingTask?.priority || getPriority(existingTask?.title || "")
  );
  const [isPriorityManuallyChanged, setIsPriorityManuallyChanged] = useState(Boolean(existingTask));

  const aiPriority = useMemo(() => getPriority(title), [title]);

  useEffect(() => {
    if (!isPriorityManuallyChanged) {
      setSelectedPriority(aiPriority);
    }
  }, [aiPriority, isPriorityManuallyChanged]);

  async function handleSaveTask() {
    if (!title.trim() || !description.trim()) {
      Alert.alert("Missing details", "Please enter a title and description.");
      return;
    }

    const nextTask = {
      id: existingTask?.id,
      userId: user.uid,
      folderId: selectedFolderId,
      title: title.trim(),
      description: description.trim(),
      dueDate: existingTask?.dueDate || new Date().toISOString().split("T")[0],
      status: existingTask?.status || "pending",
      priority: selectedPriority,
    };

    try {
      await saveTask(nextTask);
      navigation.goBack();
    } catch (error) {
      showError("Save failed", error.message || "Unable to save task.", error);
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
              <Text style={styles.title}>{existingTask ? "Edit task" : "Add task"}</Text>
              <Text style={styles.subtitle}>
                Add the task inside a folder and let AI suggest the initial priority.
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
            <Text style={styles.label}>Task title</Text>
            <TextInput
              placeholder="Example: Submit project slides"
              placeholderTextColor={theme.textMuted}
              style={styles.input}
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              placeholder="Add a short task description"
              placeholderTextColor={theme.textMuted}
              style={[styles.input, styles.textArea]}
              multiline
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />

            <Text style={styles.label}>Folder</Text>
            <View style={styles.folderOptionsWrapper}>
              <Pressable
                style={[
                  styles.folderOption,
                  selectedFolderId === "" && styles.folderOptionSelected,
                ]}
                onPress={() => setSelectedFolderId("")}
              >
                <Text
                  style={[
                    styles.folderOptionText,
                    selectedFolderId === "" && styles.folderOptionTextSelected,
                  ]}
                >
                  No Folder
                </Text>
              </Pressable>
              {folders.map((folder) => {
                const isSelected = selectedFolderId === folder.id;

                return (
                  <Pressable
                    key={folder.id}
                    style={[styles.folderOption, isSelected && styles.folderOptionSelected]}
                    onPress={() => setSelectedFolderId(folder.id)}
                  >
                    <Text
                      style={[
                        styles.folderOptionText,
                        isSelected && styles.folderOptionTextSelected,
                      ]}
                    >
                      {folder.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.label}>AI priority</Text>
            <View
              style={[
                styles.priorityCard,
                { backgroundColor: `${PRIORITY_COLORS[aiPriority]}20` },
              ]}
            >
              <Text style={[styles.priorityValue, { color: PRIORITY_COLORS[aiPriority] }]}>
                Suggested: {aiPriority}
              </Text>
              <Text style={styles.priorityNote}>
                The keyword pool now checks a much larger set of work, academic, career, health,
                finance, and casual task cases.
              </Text>
            </View>

            <Text style={styles.label}>Manual priority</Text>
            <View style={styles.priorityOptionsRow}>
              {PRIORITY_OPTIONS.map((option) => {
                const isSelected = selectedPriority === option;

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
                    onPress={() => {
                      setSelectedPriority(option);
                      setIsPriorityManuallyChanged(true);
                    }}
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

            <Pressable style={styles.saveButton} onPress={handleSaveTask}>
              <Text style={styles.saveButtonText}>
                {existingTask ? "Update Task" : "Add Task"}
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
    textArea: {
      minHeight: 110,
    },
    folderOptionsWrapper: {
      gap: 10,
    },
    folderOption: {
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.borderStrong,
      backgroundColor: theme.surfaceAlt,
      paddingHorizontal: 14,
      paddingVertical: 14,
    },
    folderOptionSelected: {
      borderColor: theme.accentBright,
      backgroundColor: theme.accentSurface,
    },
    folderOptionText: {
      color: theme.textSecondary,
      fontWeight: "700",
    },
    folderOptionTextSelected: {
      color: theme.textPrimary,
    },
    priorityCard: {
      borderRadius: 16,
      padding: 16,
    },
    priorityValue: {
      fontSize: 18,
      fontWeight: "800",
      marginBottom: 6,
    },
    priorityNote: {
      color: theme.textSoft,
      lineHeight: 20,
    },
    priorityOptionsRow: {
      flexDirection: "row",
      gap: 10,
      marginTop: 2,
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
