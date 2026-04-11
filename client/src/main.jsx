import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Toaster } from "./components/ui/toaster";
import { ThemeProvider } from "@/components/common/theme-provider";
import { API_BASE_URL } from "@/constants/api";

// Prefetch chatbot context in the background immediately on app load.
// By the time the user opens the chatbot, data is already cached.
fetch(`${API_BASE_URL}/chatbot/context`)
  .then((r) => r.json())
  .catch(() => {}); // silent — chatbot handles its own error state

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider defaultTheme="light" storageKey="carbonix-theme">
      <App />
      <Toaster />
    </ThemeProvider>
  </StrictMode>
);
