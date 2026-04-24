import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { PRIORITY_COLORS } from "../utils/priority";

export default function TaskCard({ task, onEdit, onDelete, onToggleStatus }) {
  const isCompleted = task.status === "completed";

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleWrapper}>
          <Text style={[styles.title, isCompleted && styles.completedTitle]}>{task.title}</Text>
          <Text style={styles.dueDate}>Due: {task.dueDate}</Text>
        </View>
        <View
          style={[
            styles.priorityBadge,
            { backgroundColor: `${PRIORITY_COLORS[task.priority] || "#0F766E"}20` },
          ]}
        >
          <Text style={[styles.priorityText, { color: PRIORITY_COLORS[task.priority] || "#0F766E" }]}>
            {task.priority}
          </Text>
        </View>
      </View>

      <Text style={styles.description}>
        {task.description || "No description added for this task yet."}
      </Text>

      <View style={styles.metaRow}>
        <View
          style={[
            styles.statusBadge,
            isCompleted ? styles.completedBadge : styles.pendingBadge,
          ]}
        >
          <Text style={[styles.statusText, isCompleted ? styles.completedText : styles.pendingText]}>
            {isCompleted ? "Completed" : "Pending"}
          </Text>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <Pressable style={[styles.actionButton, styles.primaryButton]} onPress={onToggleStatus}>
          <Text style={styles.primaryButtonText}>
            {isCompleted ? "Mark Pending" : "Mark Complete"}
          </Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={onEdit}>
          <Text style={styles.secondaryButtonText}>Edit</Text>
        </Pressable>
        <Pressable style={styles.deleteButton} onPress={onDelete}>
          <Text style={styles.deleteButtonText}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#0F172A",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 3,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  titleWrapper: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  completedTitle: {
    textDecorationLine: "line-through",
    color: "#64748B",
  },
  dueDate: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "500",
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  priorityText: {
    fontWeight: "700",
    fontSize: 12,
  },
  description: {
    color: "#334155",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 14,
    marginBottom: 14,
  },
  metaRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  completedBadge: {
    backgroundColor: "#DCFCE7",
  },
  pendingBadge: {
    backgroundColor: "#FEF3C7",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  completedText: {
    color: "#166534",
  },
  pendingText: {
    color: "#92400E",
  },
  actionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  actionButton: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 12,
  },
  primaryButton: {
    backgroundColor: "#0F766E",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
  secondaryButton: {
    backgroundColor: "#E2E8F0",
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 12,
  },
  secondaryButtonText: {
    color: "#0F172A",
    fontWeight: "700",
    fontSize: 13,
  },
  deleteButton: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 12,
  },
  deleteButtonText: {
    color: "#B91C1C",
    fontWeight: "700",
    fontSize: 13,
  },
});
