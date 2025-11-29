import type { Metadata } from "next";
import "./globals.css";
import { NotificationProvider } from "@/components/NotificationProvider";

export const metadata: Metadata = {
  title: "SIA2",
  description: "Auth demo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <NotificationProvider>{children}</NotificationProvider>
      </body>
    </html>
  );
}
