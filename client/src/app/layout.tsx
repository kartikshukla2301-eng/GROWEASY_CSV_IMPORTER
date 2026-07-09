import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CSV Importer — GrowEasy CRM",
  description:
    "Upload any CSV file and have AI extract and map its data into the GrowEasy CRM lead schema.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
