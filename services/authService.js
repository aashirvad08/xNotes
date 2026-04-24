import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db, isFirebaseConfigured } from "./firebase";

function ensureFirebaseConfig() {
  if (!isFirebaseConfigured) {
    throw new Error("Add your Firebase keys in the .env file before using authentication.");
  }
}

function mapAuthError(error) {
  const code = error?.code || "";

  if (code.includes("invalid-email")) {
    return "Please enter a valid email address.";
  }

  if (code.includes("email-already-in-use")) {
    return "This email is already registered.";
  }

  if (code.includes("weak-password")) {
    return "Password should be at least 6 characters long.";
  }

  if (code.includes("invalid-credential") || code.includes("wrong-password")) {
    return "The email or password is incorrect.";
  }

  if (code.includes("user-not-found")) {
    return "No account was found with that email.";
  }

  return error?.message || "Something went wrong. Please try again.";
}

export async function registerUser({ name, email, password }) {
  ensureFirebaseConfig();

  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);

    await setDoc(
      doc(db, "users", credential.user.uid),
      {
        id: credential.user.uid,
        name,
        email,
      },
      { merge: true }
    );

    return credential.user;
  } catch (error) {
    throw new Error(mapAuthError(error));
  }
}

export async function loginUser({ email, password }) {
  ensureFirebaseConfig();

  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user;
  } catch (error) {
    throw new Error(mapAuthError(error));
  }
}

export async function logoutUser() {
  ensureFirebaseConfig();

  try {
    await signOut(auth);
  } catch (error) {
    throw new Error(mapAuthError(error));
  }
}
