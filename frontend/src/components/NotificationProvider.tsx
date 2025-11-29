"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  ReactNode,
} from "react";

type NotificationType = "success" | "error" | "info";

interface NotificationState {
  message: string;
  type: NotificationType;
}

interface NotificationContextValue {
  showNotification: (message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(
  undefined
);

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return ctx;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notification, setNotification] = useState<NotificationState | null>(
    null
  );

  const showNotification = useCallback(
    (message: string, type: NotificationType = "info") => {
      setNotification({ message, type });
      // auto-hide after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    },
    []
  );

  const toastStyle: React.CSSProperties = {
    position: "fixed",
    top: 20,
    right: 20,
    padding: "0.75rem 1.25rem",
    borderRadius: 8,
    color: "white",
    fontSize: 14,
    boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
    zIndex: 9999,
  };

  const typeStyle = (type: NotificationType): React.CSSProperties => {
    switch (type) {
      case "success":
        return { backgroundColor: "#16a34a" }; // green
      case "error":
        return { backgroundColor: "#dc2626" }; // red
      case "info":
      default:
        return { backgroundColor: "#2563eb" }; // blue
    }
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notification && (
        <div style={{ ...toastStyle, ...typeStyle(notification.type) }}>
          {notification.message}
        </div>
      )}
    </NotificationContext.Provider>
  );
}
