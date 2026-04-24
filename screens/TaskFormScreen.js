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
import { saveTask } from "../services/taskService";
import { inferPriority, PRIORITY_COLORS } from "../utils/priority";

const STATUS_OPTIONS = ["pending", "completed"];

function isValidDateString(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export default function TaskFormScreen({ navigation, route, user }) {
  const existingTask = route.params?.task;
  const [title, setTitle] = useState(existingTask?.title || "");
  const [description, setDescription] = useState(existingTask?.description || "");
  const [dueDate, setDueDate] = useState(existingTask?.dueDate || "");
  const [status, setStatus] = useState(existingTask?.status || "pending");
  const [isSaving, setIsSaving] = useState(false);

  const inferredPriority = useMemo(() => inferPriority(title), [title]);

  async function handleSaveTask() {
    if (!title.trim() || !dueDate.trim()) {
      Alert.alert("Missing details", "Please enter both a title and due date.");
      return;
    }

    if (!isValidDateString(dueDate.trim())) {
      Alert.alert("Invalid date", "Use the due date format YYYY-MM-DD.");
      return;
    }

    try {
      setIsSaving(true);

      await saveTask({
        id: existingTask?.id,
        userId: user.uid,
        title,
        description,
        dueDate,
        status,
        priority: inferredPriority,
      });

      navigation.goBack();
    } catch (error) {
      Alert.alert("Save failed", error.message || "Unable to save the task.");
    } finally {
      setIsSaving(false);
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
              <Text style={styles.title}>{existingTask ? "Edit task" : "Add new task"}</Text>
              <Text style={styles.subtitle}>
                Fill in the task details and let the app assign a rule-based priority.
              </Text>
            </View>
            <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
              <Text style={styles.backButtonText}>Back</Text>
            </Pressable>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.label}>Task title</Text>
            <TextInput
              placeholder="Example: Submit final project report"
              placeholderTextColor="#94A3B8"
              style={styles.input}
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              placeholder="Add more details about the task"
              placeholderTextColor="#94A3B8"
              style={[styles.input, styles.textArea]}
              multiline
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />

            <Text style={styles.label}>Due date</Text>
            <TextInput
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#94A3B8"
              style={styles.input}
              value={dueDate}
              onChangeText={setDueDate}
            />

            <Text style={styles.label}>Status</Text>
            <View style={styles.statusRow}>
              {STATUS_OPTIONS.map((option) => {
                const isActive = status === option;

                return (
                  <Pressable
                    key={option}
                    style={[styles.statusButton, isActive && styles.statusButtonActive]}
                    onPress={() => setStatus(option)}
                  >
                    <Text style={[styles.statusButtonText, isActive && styles.statusButtonTextActive]}>
                      {option === "pending" ? "Pending" : "Completed"}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.label}>AI priority preview</Text>
            <View
              style={[
                styles.priorityPreview,
                { backgroundColor: `${PRIORITY_COLORS[inferredPriority]}20` },
              ]}
            >
              <Text style={[styles.priorityPreviewText, { color: PRIORITY_COLORS[inferredPriority] }]}>
                {inferredPriority}
              </Text>
              <Text style={styles.priorityHint}>
                Titles containing "exam", "deadline", or "submit" become High priority automatically.
              </Text>
            </View>

            <Pressable style={styles.saveButton} onPress={handleSaveTask} disabled={isSaving}>
              <Text style={styles.saveButtonText}>
                {isSaving ? "Saving..." : existingTask ? "Update Task" : "Add Task"}
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
    backgroundColor: "#F7F4EC",
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
    color: "#0F172A",
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 8,
  },
  subtitle: {
    color: "#475569",
    fontSize: 15,
    lineHeight: 22,
  },
  backButton: {
    backgroundColor: "#E2E8F0",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  backButtonText: {
    color: "#0F172A",
    fontWeight: "700",
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#0F172A",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 3,
  },
  label: {
    color: "#334155",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: "#0F172A",
  },
  textArea: {
    minHeight: 110,
  },
  statusRow: {
    flexDirection: "row",
    gap: 10,
  },
  statusButton: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingVertical: 14,
    alignItems: "center",
  },
  statusButtonActive: {
    backgroundColor: "#0F766E",
    borderColor: "#0F766E",
  },
  statusButtonText: {
    color: "#334155",
    fontWeight: "700",
  },
  statusButtonTextActive: {
    color: "#FFFFFF",
  },
  priorityPreview: {
    borderRadius: 16,
    padding: 16,
    marginTop: 2,
  },
  priorityPreviewText: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 6,
  },
  priorityHint: {
    color: "#475569",
    lineHeight: 20,
  },
  saveButton: {
    backgroundColor: "#0F766E",
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
