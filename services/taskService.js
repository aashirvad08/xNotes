import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";

function ensureFirebaseConfig() {
  if (!isFirebaseConfigured) {
    throw new Error("Add your Firebase keys in the .env file before using Firestore.");
  }
}

function getTimestampValue(task) {
  const timestamp = task?.timestamp;

  if (!timestamp) {
    return 0;
  }

  if (typeof timestamp?.toMillis === "function") {
    return timestamp.toMillis();
  }

  if (typeof timestamp?.seconds === "number") {
    return timestamp.seconds * 1000;
  }

  return new Date(timestamp).getTime() || 0;
}

function sortTasksByNewest(tasks) {
  return [...tasks].sort((firstTask, secondTask) => {
    return getTimestampValue(secondTask) - getTimestampValue(firstTask);
  });
}

function normalizeTaskPayload(taskData) {
  return {
    userId: taskData.userId,
    folderId: taskData.folderId || "",
    title: taskData.title.trim(),
    description: taskData.description.trim(),
    dueDate: taskData.dueDate.trim(),
    status: taskData.status,
    priority: taskData.priority,
  };
}

export function subscribeToTasks(userId, onTasksChange, onError) {
  ensureFirebaseConfig();

  const tasksQuery = query(collection(db, "tasks"), where("userId", "==", userId));

  return onSnapshot(
    tasksQuery,
    (snapshot) => {
      const tasks = snapshot.docs.map((taskDoc) => ({
        id: taskDoc.id,
        ...taskDoc.data(),
      }));

      onTasksChange(sortTasksByNewest(tasks));
    },
    (error) => {
      if (onError) {
        onError(error);
      }
    }
  );
}

export async function saveTask(taskData) {
  ensureFirebaseConfig();

  const payload = normalizeTaskPayload(taskData);

  if (taskData.id) {
    await updateDoc(doc(db, "tasks", taskData.id), payload);
    return taskData.id;
  }

  const taskRef = doc(collection(db, "tasks"));

  await setDoc(taskRef, {
    id: taskRef.id,
    ...payload,
    timestamp: serverTimestamp(),
  });

  return taskRef.id;
}

export async function updateTaskStatus(taskId, status) {
  ensureFirebaseConfig();
  await updateDoc(doc(db, "tasks", taskId), { status });
}

export async function deleteTask(taskId) {
  ensureFirebaseConfig();
  await deleteDoc(doc(db, "tasks", taskId));
}

export async function clearFolderFromTasks(folderId) {
  ensureFirebaseConfig();

  const tasksQuery = query(collection(db, "tasks"), where("folderId", "==", folderId));
  const snapshot = await getDocs(tasksQuery);

  await Promise.all(
    snapshot.docs.map((taskDoc) => updateDoc(doc(db, "tasks", taskDoc.id), { folderId: "" }))
  );
}
