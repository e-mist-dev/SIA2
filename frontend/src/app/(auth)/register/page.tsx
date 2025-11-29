"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithCustomToken, updatePassword } from "firebase/auth";
import { auth } from "../../../../lib/firebase";
import { useNotification } from "@/components/NotificationProvider";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function RegisterPage() {
  const router = useRouter();
  const { showNotification } = useNotification(); // ✅ hook inside component

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [otpStep, setOtpStep] = useState<"idle" | "sent">("idle");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const sendOtp = async () => {
    if (!email) {
      setError("Enter your email first.");
      return;
    }
    if (!password) {
      setError("Please choose a password.");
      return;
    }
    setError(null);
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/auth/otp/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to send OTP.");
        showNotification("Failed to send OTP", "error");
        return;
      }
      setOtpStep("sent");
      setMessage("OTP sent to your email.");
      showNotification("OTP sent to your email", "info");
    } catch (err: any) {
      console.error(err);
      setError("Error sending OTP.");
      showNotification("Error sending OTP", "error");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp) {
      setError("Enter the OTP.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }
    setError(null);
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/auth/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to verify OTP.");
        showNotification("Failed to verify OTP", "error");
        return;
      }

      const customToken = data.customToken;
      await signInWithCustomToken(auth, customToken);

      if (auth.currentUser) {
        await updatePassword(auth.currentUser, password);
      }

      showNotification("Registered successfully", "success");
      router.push("/login");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error verifying OTP / setting password.");
      showNotification("Error verifying OTP / setting password", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Sign Up</h1>

        <label style={styles.label}>
          Email
          <input
            style={styles.input}
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label style={styles.label}>
          Password
          <input
            style={styles.input}
            type="password"
            placeholder="Enter a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {otpStep === "sent" && (
          <label style={styles.label}>
            OTP
            <input
              style={styles.input}
              type="text"
              placeholder="Enter OTP from email"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </label>
        )}

        {otpStep === "idle" ? (
          <button style={styles.mainButton} onClick={sendOtp} disabled={loading}>
            {loading ? "Sending..." : "Send OTP"}
          </button>
        ) : (
          <button style={styles.mainButton} onClick={verifyOtp} disabled={loading}>
            {loading ? "Verifying..." : "Verify & Sign up"}
          </button>
        )}

        <p style={{ marginTop: 20, textAlign: "center" }}>
          Already have an account?{" "}
          <button style={styles.linkButton} onClick={() => router.push("/login")}>
            Login
          </button>
        </p>

        {message && <p style={{ color: "green", marginTop: 10 }}>{message}</p>}
        {error && <p style={{ color: "red", marginTop: 10 }}>{error}</p>}
      </div>
    </div>
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
    marginBottom: 16,
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
  mainButton: {
    marginTop: 8,
    width: "100%",
    border: "none",
    borderRadius: 999,
    padding: "0.9rem",
    fontWeight: 600,
    color: "white",
    cursor: "pointer",
    backgroundImage: "linear-gradient(90deg,#22c1c3,#f72585)",
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
};
