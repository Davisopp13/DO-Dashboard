import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { get, set } from "idb-keyval";
import Dashboard from "../Dashboard.jsx";

window.storage = {
  get: async (key) => {
    const value = await get(key);
    return value !== undefined ? { value } : null;
  },
  set: async (key, value) => {
    await set(key, value);
  },
};

if (navigator.storage?.persist) {
  navigator.storage.persist();
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Dashboard />
  </StrictMode>
);
