import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import ChatWidget from '@/components/chat/ChatWidget';

export const metadata: Metadata = {
  title: "MarTech MVP",
  description: "Scaffold for MarTech MVP v1"
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        {children}
        <ChatWidget />
      </body>
    </html>
  );
}
