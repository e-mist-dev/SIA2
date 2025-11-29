"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "../../../../lib/firebase";
import { useNotification } from "@/components/NotificationProvider";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;


export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState(""); 
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  const handlePasswordLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username || !password) {
      setError("Please enter username and password.");
      return;
    }

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, username, password);
      showNotification("Logged in successfully", "success");
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      showNotification("Invalid email or password", "error");
      setError(err.message || "Failed to login.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError(null);
      setLoading(true);

      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      // Optional: send idToken to backend for googleAuth controller
      const idToken = await result.user.getIdToken();
      await fetch(`${API_BASE}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      showNotification("Logged in successfully", "success");
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Google sign in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Login</h1>

        <form onSubmit={handlePasswordLogin}>
          <label style={styles.label}>
            Username
            <input
              style={styles.input}
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>

          <label style={styles.label}>
            Password
            <input
              style={styles.input}
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <button type="submit" style={styles.loginButton} disabled={loading}>
            {loading ? "Logging in..." : "LOGIN"}
          </button>
        </form>

        {/* SIGN IN AS - GOOGLE */}
        <p style={styles.orText}>Sign In As</p>
        <button
          type="button"
          style={styles.googleButton}
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <span style={{ display: "inline-flex", marginRight: 8 }}>
            <GoogleIcon />
          </span>
          <span>Google</span>
        </button>

        <p style={{ marginTop: 20, textAlign: "center" }}>
          Don&apos;t have an account?{" "}
          <button
            style={styles.linkButton}
            onClick={() => router.push("/register")}
          >
            Sign up
          </button>
        </p>

        {error && <p style={styles.error}>{error}</p>}
      </div>
    </div>
  );
}

/** Google SVG as React component */
function GoogleIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="-0.5 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill="none" fillRule="evenodd">
        <g transform="translate(-401 -860)">
          <g transform="translate(401 860)">
            <path
              d="M9.82727273,24 C9.82727273,22.4757333 10.0804318,21.0144 10.5322727,19.6437333 L2.62345455,13.6042667 C1.08206818,16.7338667 0.213636364,20.2602667 0.213636364,24 C0.213636364,27.7365333 1.081,31.2608 2.62025,34.3882667 L10.5247955,28.3370667 C10.0772273,26.9728 9.82727273,25.5168 9.82727273,24"
              fill="#FBBC05"
            />
            <path
              d="M23.7136364,10.1333333 C27.025,10.1333333 30.0159091,11.3066667 32.3659091,13.2266667 L39.2022727,6.4 C35.0363636,2.77333333 29.6954545,0.533333333 23.7136364,0.533333333 C14.4268636,0.533333333 6.44540909,5.84426667 2.62345455,13.6042667 L10.5322727,19.6437333 C12.3545909,14.112 17.5491591,10.1333333 23.7136364,10.1333333"
              fill="#EB4335"
            />
            <path
              d="M23.7136364,37.8666667 C17.5491591,37.8666667 12.3545909,33.888 10.5322727,28.3562667 L2.62345455,34.3946667 C6.44540909,42.1557333 14.4268636,47.4666667 23.7136364,47.4666667 C29.4455,47.4666667 34.9177955,45.4314667 39.0249545,41.6181333 L31.5177727,35.8144 C29.3995682,37.1488 26.7323182,37.8666667 23.7136364,37.8666667"
              fill="#34A853"
            />
            <path
              d="M46.1454545,24 C46.1454545,22.6133333 45.9318182,21.12 45.6113636,19.7333333 L23.7136364,19.7333333 L23.7136364,28.8 L36.3181818,28.8 C35.6879545,31.8912 33.9724545,34.2677333 31.5177727,35.8144 L39.0249545,41.6181333 C43.3393409,37.6138667 46.1454545,31.6490667 46.1454545,24"
              fill="#4285F4"
            />
          </g>
        </g>
      </g>
    </svg>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg,#8b5cf6,#ec4899)",
    padding: 16,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "white",
    borderRadius: 24,
    padding: "2.5rem 2rem",
    boxShadow: "0 15px 40px rgba(0,0,0,0.15)",
  },
  title: {
    textAlign: "center",
    fontSize: 28,
    fontWeight: 700,
    marginBottom: 24,
  },
  label: {
    display: "block",
    fontSize: 14,
    marginBottom: 20,
    color: "#6b7280",
  },
  input: {
    marginTop: 6,
    width: "100%",
    border: "none",
    borderBottom: "1px solid #e5e7eb",
    padding: "8px 4px",
    outline: "none",
  },
  linkButton: {
    border: "none",
    background: "none",
    color: "#6b7280",
    cursor: "pointer",
    padding: 0,
    fontSize: 14,
    textDecoration: "underline",
  },
  loginButton: {
    marginTop: 24,
    width: "100%",
    border: "none",
    borderRadius: 999,
    padding: "0.9rem",
    fontWeight: 600,
    color: "white",
    cursor: "pointer",
    backgroundImage: "linear-gradient(90deg,#22c1c3,#f72585)",
  },
  orText: {
    textAlign: "center",
    marginTop: 24,
    fontSize: 14,
    color: "#9ca3af",
  },
  googleButton: {
    marginTop: 10,
    width: "100%",
    borderRadius: 999,
    padding: "0.7rem 1rem",
    border: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "white",
    cursor: "pointer",
    fontWeight: 500,
  },
  error: {
    marginTop: 16,
    color: "red",
    textAlign: "center",
  },
};
