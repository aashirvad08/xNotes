import React, { useMemo } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import FilterTabs from "../components/FilterTabs";
import FloatingActionButton from "../components/FloatingActionButton";
import { logoutUser } from "../services/authService";
import { clearFolderFromTasks, deleteTask, updateTaskStatus } from "../services/taskService";
import { deleteFolder } from "../services/folderService";
import { getToggleLabel, PRIORITY_COLORS } from "../theme";

function getFolderPriority(folder, tasks) {
  if (folder.priorityMode === "manual") {
    return folder.manualPriority;
  }

  const folderTasks = tasks.filter((task) => task.folderId === folder.id);

  if (folderTasks.length === 0) {
    return "Low";
  }

  const counts = {
    High: 0,
    Medium: 0,
    Low: 0,
  };

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

export default function HomeScreen({
  navigation,
  user,
  tasks,
  folders,
  theme,
  themeName,
  toggleTheme,
}) {
  const [activeFilter, setActiveFilter] = React.useState("all");
  const [selectedFolderId, setSelectedFolderId] = React.useState("all");
  const styles = createStyles(theme);

  const filteredTasks = useMemo(() => {
    let nextTasks = tasks;

    if (selectedFolderId !== "all") {
      nextTasks = nextTasks.filter((task) => task.folderId === selectedFolderId);
    }

    if (activeFilter !== "all") {
      nextTasks = nextTasks.filter((task) => task.status === activeFilter);
    }

    return nextTasks;
  }, [activeFilter, selectedFolderId, tasks]);

  const completedCount = tasks.filter((task) => task.status === "completed").length;
  const pendingCount = tasks.filter((task) => task.status === "pending").length;

  async function handleToggleStatus(task) {
    try {
      const nextStatus = task.status === "completed" ? "pending" : "completed";
      await updateTaskStatus(task.id, nextStatus);
    } catch (error) {
      Alert.alert("Update failed", error.message);
    }
  }

  function handleDeleteTask(taskId) {
    Alert.alert("Delete task", "Remove this task from the list?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteTask(taskId);
          } catch (error) {
            Alert.alert("Delete failed", error.message);
          }
        },
      },
    ]);
  }

  function handleDeleteFolder(folderId) {
    Alert.alert("Delete folder", "Delete this folder and keep its tasks outside the folder?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await clearFolderFromTasks(folderId);
            await deleteFolder(folderId);

            if (selectedFolderId === folderId) {
              setSelectedFolderId("all");
            }
          } catch (error) {
            Alert.alert("Delete failed", error.message);
          }
        },
      },
    ]);
  }

  function getFolderName(folderId) {
    if (!folderId) {
      return "No Folder";
    }

    const folder = folders.find((item) => item.id === folderId);
    return folder ? folder.name : "No Folder";
  }

  function renderFolderCard(folder) {
    const folderPriority = getFolderPriority(folder, tasks);
    const folderTaskCount = tasks.filter((task) => task.folderId === folder.id).length;
    const isSelected = selectedFolderId === folder.id;

    return (
      <Pressable
        key={folder.id}
        style={[styles.folderCard, isSelected && styles.folderCardSelected]}
        onPress={() => setSelectedFolderId(folder.id)}
      >
        <View style={styles.folderHeader}>
          <View style={styles.folderHeaderText}>
            <Text style={styles.folderName}>{folder.name}</Text>
            <Text style={styles.folderMode}>
              {folder.priorityMode === "manual" ? "Manual priority" : "AI priority"}
            </Text>
          </View>
          <View
            style={[
              styles.folderPriorityBadge,
              { backgroundColor: `${PRIORITY_COLORS[folderPriority]}20` },
            ]}
          >
            <Text
              style={[
                styles.folderPriorityText,
                { color: PRIORITY_COLORS[folderPriority] },
              ]}
            >
              {folderPriority}
            </Text>
          </View>
        </View>

        <Text style={styles.folderMeta}>{folderTaskCount} task(s)</Text>

        <View style={styles.folderActionsRow}>
          <Pressable
            style={styles.folderAction}
            onPress={() => navigation.navigate("FolderForm", { folder })}
          >
            <Text style={styles.folderActionText}>Edit</Text>
          </Pressable>
          <Pressable
            style={styles.folderDeleteAction}
            onPress={() => handleDeleteFolder(folder.id)}
          >
            <Text style={styles.folderDeleteText}>Delete</Text>
          </Pressable>
        </View>
      </Pressable>
    );
  }

  function renderTaskCard({ item }) {
    const isCompleted = item.status === "completed";

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderText}>
            <Text style={[styles.taskTitle, isCompleted && styles.taskTitleCompleted]}>
              {item.title}
            </Text>
            <Text style={styles.taskDescription}>{item.description}</Text>
          </View>

          <View
            style={[
              styles.priorityBadge,
              { backgroundColor: `${PRIORITY_COLORS[item.priority] || PRIORITY_COLORS.Low}20` },
            ]}
          >
            <Text
              style={[
                styles.priorityText,
                { color: PRIORITY_COLORS[item.priority] || PRIORITY_COLORS.Low },
              ]}
            >
              {item.priority}
            </Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.folderPill}>
            <Text style={styles.folderPillText}>{getFolderName(item.folderId)}</Text>
          </View>
          <View style={[styles.statusBadge, isCompleted ? styles.doneBadge : styles.pendingBadge]}>
            <Text style={[styles.statusText, isCompleted ? styles.doneText : styles.pendingText]}>
              {isCompleted ? "Completed" : "Pending"}
            </Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <Pressable
            style={[styles.actionButton, styles.primaryAction]}
            onPress={() => handleToggleStatus(item)}
          >
            <Text style={styles.primaryActionText}>
              {isCompleted ? "Mark Pending" : "Mark Complete"}
            </Text>
          </Pressable>

          <Pressable
            style={styles.secondaryAction}
            onPress={() => navigation.navigate("AddTask", { task: item })}
          >
            <Text style={styles.secondaryActionText}>Edit</Text>
          </Pressable>

          <Pressable style={styles.deleteAction} onPress={() => handleDeleteTask(item.id)}>
            <Text style={styles.deleteActionText}>Delete</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View style={styles.headerTextWrapper}>
            <Text style={styles.heading}>My Tasks</Text>
            <Text style={styles.subheading}>{user.email}</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable style={styles.themeButton} onPress={toggleTheme}>
              <Text style={styles.themeButtonText}>{getToggleLabel(themeName)} Mode</Text>
            </Pressable>
            <Pressable
              style={styles.logoutButton}
              onPress={async () => {
                try {
                  await logoutUser();
                } catch (error) {
                  Alert.alert("Logout failed", error.message);
                }
              }}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Folders and tasks</Text>
          <Text style={styles.summarySubtitle}>
            {pendingCount} pending • {completedCount} completed • {folders.length} folders
          </Text>
        </View>

        <View style={styles.folderSectionHeader}>
          <Text style={styles.sectionTitle}>Folders</Text>
          <Pressable
            style={styles.newFolderButton}
            onPress={() => navigation.navigate("FolderForm")}
          >
            <Text style={styles.newFolderButtonText}>New Folder</Text>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.folderScrollContent}
        >
          <Pressable
            style={[
              styles.allFoldersCard,
              selectedFolderId === "all" && styles.folderCardSelected,
            ]}
            onPress={() => setSelectedFolderId("all")}
          >
            <Text style={styles.folderName}>All Folders</Text>
            <Text style={styles.folderMode}>View every task</Text>
          </Pressable>
          {folders.map((folder) => renderFolderCard(folder))}
        </ScrollView>

        <FilterTabs activeFilter={activeFilter} onChange={setActiveFilter} theme={theme} />

        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={renderTaskCard}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No tasks in this view</Text>
              <Text style={styles.emptyText}>
                Add a new task, create a folder, or switch filters to see more.
              </Text>
            </View>
          }
        />

        <FloatingActionButton onPress={() => navigation.navigate("AddTask")} theme={theme} />
      </View>
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
      paddingHorizontal: 18,
      paddingTop: 12,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 18,
    },
    headerTextWrapper: {
      flex: 1,
      paddingRight: 12,
    },
    headerActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    heading: {
      color: theme.textPrimary,
      fontSize: 30,
      fontWeight: "800",
      marginBottom: 4,
    },
    subheading: {
      color: theme.textMuted,
      fontSize: 14,
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
    logoutButton: {
      backgroundColor: theme.surfaceStrong,
      borderWidth: 1,
      borderColor: theme.borderStrong,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 12,
    },
    logoutText: {
      color: theme.accentText,
      fontWeight: "700",
      fontSize: 13,
    },
    summaryCard: {
      backgroundColor: theme.accentSurface,
      borderWidth: 1,
      borderColor: theme.accentBorder,
      borderRadius: 24,
      padding: 20,
      marginBottom: 16,
    },
    summaryTitle: {
      color: theme.textPrimary,
      fontSize: 22,
      fontWeight: "800",
      marginBottom: 6,
    },
    summarySubtitle: {
      color: theme.accentText,
      fontSize: 14,
      fontWeight: "600",
    },
    folderSectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },
    sectionTitle: {
      color: theme.textPrimary,
      fontSize: 20,
      fontWeight: "800",
    },
    newFolderButton: {
      backgroundColor: theme.surfaceStrong,
      borderWidth: 1,
      borderColor: theme.accentBorder,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 12,
    },
    newFolderButtonText: {
      color: theme.accentText,
      fontSize: 13,
      fontWeight: "700",
    },
    folderScrollContent: {
      paddingBottom: 16,
      gap: 12,
    },
    allFoldersCard: {
      width: 165,
      backgroundColor: theme.surface,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 16,
    },
    folderCard: {
      width: 220,
      backgroundColor: theme.surface,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 16,
    },
    folderCardSelected: {
      borderColor: theme.accentBright,
      shadowColor: theme.accentBright,
      shadowOpacity: 0.18,
      shadowRadius: 12,
      shadowOffset: {
        width: 0,
        height: 4,
      },
    },
    folderHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 10,
    },
    folderHeaderText: {
      flex: 1,
      paddingRight: 10,
    },
    folderName: {
      color: theme.textPrimary,
      fontSize: 17,
      fontWeight: "800",
      marginBottom: 4,
    },
    folderMode: {
      color: theme.textSoft,
      fontSize: 12,
    },
    folderMeta: {
      color: theme.accentText,
      fontSize: 13,
      marginBottom: 12,
    },
    folderPriorityBadge: {
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    folderPriorityText: {
      fontSize: 12,
      fontWeight: "800",
    },
    folderActionsRow: {
      flexDirection: "row",
      gap: 10,
    },
    folderAction: {
      backgroundColor: theme.surfaceStrong,
      borderWidth: 1,
      borderColor: theme.borderStrong,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 9,
    },
    folderActionText: {
      color: theme.accentText,
      fontSize: 12,
      fontWeight: "700",
    },
    folderDeleteAction: {
      backgroundColor: "#2A1122",
      borderWidth: 1,
      borderColor: "#5B1739",
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 9,
    },
    folderDeleteText: {
      color: "#FCA5A5",
      fontSize: 12,
      fontWeight: "700",
    },
    listContent: {
      paddingBottom: 110,
    },
    card: {
      backgroundColor: theme.surface,
      borderRadius: 24,
      padding: 18,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: theme.shadow,
      shadowOpacity: 0.24,
      shadowRadius: 12,
      shadowOffset: {
        width: 0,
        height: 8,
      },
      elevation: 5,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    cardHeaderText: {
      flex: 1,
      paddingRight: 10,
    },
    taskTitle: {
      color: theme.textPrimary,
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 6,
    },
    taskTitleCompleted: {
      color: theme.textMuted,
      textDecorationLine: "line-through",
    },
    taskDescription: {
      color: theme.textSoft,
      lineHeight: 21,
      fontSize: 14,
    },
    priorityBadge: {
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    priorityText: {
      fontSize: 12,
      fontWeight: "800",
    },
    metaRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 14,
      marginBottom: 14,
    },
    folderPill: {
      backgroundColor: theme.surfaceStrong,
      borderWidth: 1,
      borderColor: theme.borderStrong,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    folderPillText: {
      color: theme.textSecondary,
      fontSize: 12,
      fontWeight: "700",
    },
    statusBadge: {
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    doneBadge: {
      backgroundColor: "#DCFCE7",
    },
    pendingBadge: {
      backgroundColor: "#FEF3C7",
    },
    statusText: {
      fontSize: 12,
      fontWeight: "800",
    },
    doneText: {
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
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 11,
    },
    primaryAction: {
      backgroundColor: theme.accent,
    },
    primaryActionText: {
      color: "#FFFFFF",
      fontSize: 13,
      fontWeight: "700",
    },
    secondaryAction: {
      backgroundColor: theme.surfaceStrong,
      borderWidth: 1,
      borderColor: theme.borderStrong,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 11,
    },
    secondaryActionText: {
      color: theme.accentText,
      fontSize: 13,
      fontWeight: "700",
    },
    deleteAction: {
      backgroundColor: "#2A1122",
      borderWidth: 1,
      borderColor: "#5B1739",
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 11,
    },
    deleteActionText: {
      color: "#B91C1C",
      fontSize: 13,
      fontWeight: "700",
    },
    emptyState: {
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 24,
      padding: 24,
      marginTop: 12,
      alignItems: "center",
    },
    emptyTitle: {
      color: theme.textPrimary,
      fontWeight: "800",
      fontSize: 18,
      marginBottom: 8,
    },
    emptyText: {
      color: theme.textSoft,
      textAlign: "center",
      lineHeight: 22,
    },
  });
}
