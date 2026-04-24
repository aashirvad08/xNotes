import {
  collection,
  deleteDoc,
  doc,
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

function sortFoldersByNewest(folders) {
  return [...folders].sort((firstFolder, secondFolder) => {
    const firstValue =
      typeof firstFolder?.timestamp?.toMillis === "function"
        ? firstFolder.timestamp.toMillis()
        : 0;
    const secondValue =
      typeof secondFolder?.timestamp?.toMillis === "function"
        ? secondFolder.timestamp.toMillis()
        : 0;

    return secondValue - firstValue;
  });
}

export function subscribeToFolders(userId, onFoldersChange, onError) {
  ensureFirebaseConfig();

  const foldersQuery = query(collection(db, "folders"), where("userId", "==", userId));

  return onSnapshot(
    foldersQuery,
    (snapshot) => {
      const folders = snapshot.docs.map((folderDoc) => ({
        id: folderDoc.id,
        ...folderDoc.data(),
      }));

      onFoldersChange(sortFoldersByNewest(folders));
    },
    (error) => {
      if (onError) {
        onError(error);
      }
    }
  );
}

export async function saveFolder(folderData) {
  ensureFirebaseConfig();

  const payload = {
    userId: folderData.userId,
    name: folderData.name.trim(),
    priorityMode: folderData.priorityMode,
    manualPriority: folderData.manualPriority,
  };

  if (folderData.id) {
    await updateDoc(doc(db, "folders", folderData.id), payload);
    return folderData.id;
  }

  const folderRef = doc(collection(db, "folders"));

  await setDoc(folderRef, {
    id: folderRef.id,
    ...payload,
    timestamp: serverTimestamp(),
  });

  return folderRef.id;
}

export async function deleteFolder(folderId) {
  ensureFirebaseConfig();
  await deleteDoc(doc(db, "folders", folderId));
}
