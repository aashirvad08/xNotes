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

const PRIORITY_COLORS = {
  High: "#DC2626",
  Medium: "#D97706",
  Low: "#15803D",
};

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
}) {
  const [activeFilter, setActiveFilter] = React.useState("all");
  const [selectedFolderId, setSelectedFolderId] = React.useState("all");

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
    Alert.alert("Delete task", "Remove this task from the demo list?", [
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
              { backgroundColor: `${PRIORITY_COLORS[item.priority] || "#15803D"}20` },
            ]}
          >
            <Text
              style={[
                styles.priorityText,
                { color: PRIORITY_COLORS[item.priority] || "#15803D" },
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

        <FilterTabs activeFilter={activeFilter} onChange={setActiveFilter} />

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

        <FloatingActionButton onPress={() => navigation.navigate("AddTask")} />
      </View>
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
  heading: {
    color: "#F5F3FF",
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 4,
  },
  subheading: {
    color: "#A1A1AA",
    fontSize: 14,
  },
  logoutButton: {
    backgroundColor: "#1B1529",
    borderWidth: 1,
    borderColor: "#34274E",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  logoutText: {
    color: "#E9D5FF",
    fontWeight: "700",
    fontSize: 13,
  },
  summaryCard: {
    backgroundColor: "#1A122A",
    borderWidth: 1,
    borderColor: "#4C1D95",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  summaryTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 6,
  },
  summarySubtitle: {
    color: "#D8B4FE",
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
    color: "#F5F3FF",
    fontSize: 20,
    fontWeight: "800",
  },
  newFolderButton: {
    backgroundColor: "#1B1529",
    borderWidth: 1,
    borderColor: "#4C1D95",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  newFolderButtonText: {
    color: "#D8B4FE",
    fontSize: 13,
    fontWeight: "700",
  },
  folderScrollContent: {
    paddingBottom: 16,
    gap: 12,
  },
  allFoldersCard: {
    width: 165,
    backgroundColor: "#161321",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#2B2540",
    padding: 16,
  },
  folderCard: {
    width: 220,
    backgroundColor: "#161321",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#2B2540",
    padding: 16,
  },
  folderCardSelected: {
    borderColor: "#A855F7",
    shadowColor: "#A855F7",
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
    color: "#F5F3FF",
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 4,
  },
  folderMode: {
    color: "#B3AEC2",
    fontSize: 12,
  },
  folderMeta: {
    color: "#C4B5FD",
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
    backgroundColor: "#1B1529",
    borderWidth: 1,
    borderColor: "#34274E",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  folderActionText: {
    color: "#E9D5FF",
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
    backgroundColor: "#161321",
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#2B2540",
    shadowColor: "#000000",
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
    color: "#F5F3FF",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  taskTitleCompleted: {
    color: "#8B849C",
    textDecorationLine: "line-through",
  },
  taskDescription: {
    color: "#B3AEC2",
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
    backgroundColor: "#1B1529",
    borderWidth: 1,
    borderColor: "#34274E",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  folderPillText: {
    color: "#D8B4FE",
    fontSize: 12,
    fontWeight: "700",
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  doneBadge: {
    backgroundColor: "#221B33",
  },
  pendingBadge: {
    backgroundColor: "#2A1E3E",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "800",
  },
  doneText: {
    color: "#C084FC",
  },
  pendingText: {
    color: "#E9D5FF",
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
    backgroundColor: "#7E22CE",
  },
  primaryActionText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  secondaryAction: {
    backgroundColor: "#1B1529",
    borderWidth: 1,
    borderColor: "#34274E",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  secondaryActionText: {
    color: "#E9D5FF",
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
    backgroundColor: "#161321",
    borderWidth: 1,
    borderColor: "#2B2540",
    borderRadius: 24,
    padding: 24,
    marginTop: 12,
    alignItems: "center",
  },
  emptyTitle: {
    color: "#F5F3FF",
    fontWeight: "800",
    fontSize: 18,
    marginBottom: 8,
  },
  emptyText: {
    color: "#B3AEC2",
    textAlign: "center",
    lineHeight: 22,
  },
});
