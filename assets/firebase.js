import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  update,
  get,
  child,
  remove,
  set
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const registrationsRef = ref(db, "registrations");

setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Failed to set auth persistence", error);
});

export function observeAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}

export function getCurrentUser() {
  return auth.currentUser;
}

export async function loginWithEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function logoutUser() {
  return signOut(auth);
}

export async function requireAuth() {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      if (user) {
        resolve(user);
      } else {
        const currentPath = window.location.pathname + window.location.search + window.location.hash;
        const loginUrl = new URL("./login.html", window.location.href);
        loginUrl.searchParams.set("redirect", currentPath);
        window.location.replace(loginUrl.toString());
      }
    });
  });
}

export async function fetchRegistrations() {
  const snapshot = await get(registrationsRef);
  if (!snapshot.exists()) return [];

  return Object.entries(snapshot.val()).map(([id, value]) => ({ id, ...value }));
}

export async function searchByPhoneLast3(last3) {
  const all = await fetchRegistrations();
  return all.filter((item) => String(item.phone || "").slice(-3) === last3);
}

export async function markCheckin(id, checkedInCount, checkedInBy) {
  const now = new Date().toISOString();
  await update(child(registrationsRef, id), {
    status: "已報到",
    checkedInCount,
    checkedInBy: checkedInBy || "",
    checkinTime: now,
    updatedAt: now
  });
}

function buildRegistration(row, now) {
  return {
    name: row.name,
    phone: row.phone,
    registeredCount: row.registeredCount,
    checkedInCount: null,
    status: "未報到",
    checkinTime: null,
    checkedInBy: "",
    note: row.note || "",
    createdAt: now,
    updatedAt: now
  };
}

export async function replaceRegistrations(rows) {
  const payload = {};
  const now = new Date().toISOString();
  rows.forEach((row) => {
    const newRef = push(registrationsRef);
    payload[newRef.key] = buildRegistration(row, now);
  });
  await set(registrationsRef, payload);
}

export async function appendRegistrations(rows) {
  const now = new Date().toISOString();
  for (const row of rows) {
    const newRef = push(registrationsRef);
    await set(newRef, buildRegistration(row, now));
  }
}

export async function clearRegistrations() {
  await remove(registrationsRef);
}
