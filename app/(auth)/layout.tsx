import type { Metadata } from "next";
// import { Inter } from "next/font/google";
import "@/assets/styles/globals.css";

// const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NextJSStore",
  description: "NextJS eCoomerce",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="flex-center min-h-screen w-full">{children}</div>;
}
