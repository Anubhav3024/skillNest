import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import AuthProvider from "@/context/auth-context";
import InstructorProvider from "./context/instructor-context/index.jsx";
import StudentProvider from "./context/student-context/index.jsx";

// If a user has a stale cached HTML referencing old hashed chunks, Vite route
// lazy-loads can fail with "Failed to fetch dynamically imported module" and
// the server may respond with index.html (text/html) for the missing chunk.
// Reloading once recovers by fetching the latest build.
window.addEventListener("unhandledrejection", (event) => {
  const message =
    event?.reason?.message ||
    (typeof event?.reason === "string" ? event.reason : "");

  if (
    typeof message === "string" &&
    message.includes("Failed to fetch dynamically imported module")
  ) {
    const key = "__skillnest_chunk_reload__";
    const lastReload = Number.parseInt(localStorage.getItem(key) || "", 10);
    const cooldownMs = 30 * 60 * 1000;
    if (!Number.isFinite(lastReload) || Date.now() - lastReload > cooldownMs) {
      localStorage.setItem(key, String(Date.now()));
      window.location.reload();
    }
  }
});

createRoot(document.getElementById("root")).render(
  <BrowserRouter
    future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
  >
    <AuthProvider>
      <InstructorProvider>
        <StudentProvider>
          <App />
        </StudentProvider>
      </InstructorProvider>
    </AuthProvider>
  </BrowserRouter>
);

