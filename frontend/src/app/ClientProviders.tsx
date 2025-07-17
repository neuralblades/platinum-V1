"use client";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/contexts/ToastContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import dynamic from "next/dynamic";

const Chatbot = dynamic(() => import("@/components/chatbot/Chatbot"), { ssr: false });

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
        <div className="global-chatbot">
          <Chatbot />
        </div>
      </ToastProvider>
    </AuthProvider>
  );
} 