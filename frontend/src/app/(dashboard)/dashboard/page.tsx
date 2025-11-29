"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "../../../../lib/firebase";
import { useNotification } from "@/components/NotificationProvider"; // adjust path if needed

export default function DashboardPage() {
  const router = useRouter();
  const { showNotification } = useNotification();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        router.replace("/login");
      } else {
        setUser(u);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  const handleSignOut = async () => {
    const confirmed = window.confirm("Are you sure you want to sign out?");
    if (!confirmed) return; // user cancelled

    try {
      await signOut(auth);
      showNotification("Signed out", "info");
      router.push("/login");
    } catch (err) {
      console.error(err);
      showNotification("Failed to sign out", "error");
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <p>Loading...</p>
      </div>
    );
  }

  const displayName = user?.displayName || user?.email || "User";

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        {/* NAVBAR */}
        <header style={styles.navbar}>
          <div style={styles.navLeft}>
            <span style={styles.brand}>Dashboard</span>
            <span style={styles.userName}>{displayName}</span>
          </div>
          <button style={styles.navSignOut} onClick={handleSignOut}>
            Sign out
          </button>
        </header>

      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: "100vh",
    background: "#f3f4f6",
    display: "flex",
    justifyContent: "center",
  },
  shell: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
  },
  navbar: {
    height: 64,
    padding: "0 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
  },
  navLeft: {
    display: "flex",
    flexDirection: "column",
  },
  brand: {
    fontSize: 16,
    fontWeight: 700,
  },
  userName: {
    fontSize: 13,
    color: "#6b7280",
  },
  navSignOut: {
    border: "none",
    borderRadius: 999,
    padding: "0.4rem 1.2rem",
    backgroundColor: "#ef4444",
    color: "white",
    fontSize: 14,
    cursor: "pointer",
  },
};
