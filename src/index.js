import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

// ─── RENDER ───────────────────────────────────────────────────────────────────
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// ─── SERVICE WORKER REGISTRATION ─────────────────────────────────────────────
// Only register in production. In development, the SW would intercept
// hot-module-reloading requests and break the dev server feedback loop.

if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
  window.addEventListener("load", () => {
    const swUrl = `${process.env.PUBLIC_URL}/sw.js`;

    navigator.serviceWorker
      .register(swUrl)
      .then((registration) => {
        console.log("[SW] Registered. Scope:", registration.scope);

        // Check for updates every time the user navigates
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;

          installingWorker.onstatechange = () => {
            if (installingWorker.state === "installed") {
              if (navigator.serviceWorker.controller) {
                // New content available — prompt user to refresh
                console.log("[SW] New version available. Reload to update.");

                // Optional: Show a toast/banner to the user
                // You can dispatch a custom event that your React app listens to
                window.dispatchEvent(new CustomEvent("sw:update-available"));
              } else {
                // Content cached for offline use
                console.log("[SW] Content cached for offline use.");
                window.dispatchEvent(new CustomEvent("sw:cached"));
              }
            }
          };
        };
      })
      .catch((error) => {
        console.error("[SW] Registration failed:", error);
      });

    // Detect when the SW takes control (after update + reload)
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      console.log("[SW] Controller changed — page is now controlled by new SW.");
    });
  });
}