import type { Metadata } from "next";
import "./globals.css";
import { ReactQueryProvider } from "../lib/react-query-provider";
import { Header } from "./_components/header";

export const metadata: Metadata = {
  title: "F1 Insight Hub",
  description: "Formula 1 race data, statistics, and insights",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="antialiased">
        <ReactQueryProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
          </div>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
