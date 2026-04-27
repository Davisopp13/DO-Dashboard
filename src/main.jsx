import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { get, set } from "idb-keyval";
import Dashboard from "../Dashboard.jsx";

const STORAGE_KEYS = [
  "completedTasks", "customTasks", "weights", "notes",
  "foundationVerse", "presenceDays", "carryingNotes", "cycleDecisions",
  "resourceUrl_budgetPlan",
];

window.storage = {
  get: async (key) => {
    const value = await get(key);
    return value !== undefined ? { value } : null;
  },
  set: async (key, value) => {
    await set(key, value);
  },
};

async function migrateFromLocalStorage() {
  let migrated = 0;
  for (const key of STORAGE_KEYS) {
    const lsValue = localStorage.getItem(key);
    if (lsValue !== null) {
      try {
        await set(key, lsValue);
        localStorage.removeItem(key);
        migrated++;
      } catch (e) {
        console.warn(`[DO Dashboard] Migration failed for "${key}" — localStorage data preserved.`, e);
      }
    }
  }
  if (migrated > 0) {
    console.log(`[DO Dashboard] Migrated ${migrated} key(s) from localStorage → IndexedDB.`);
  }
}

if (navigator.storage?.persist) {
  navigator.storage.persist().then((granted) => {
    console.log(`[DO Dashboard] navigator.storage.persist() granted: ${granted}`);
  });
}

migrateFromLocalStorage().then(() => {
  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <Dashboard />
    </StrictMode>
  );
});
