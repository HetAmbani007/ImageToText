import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClearText — Image to text",
  description: "Turn images into accurate, editable text."
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
