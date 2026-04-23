"use client";

import React, { useState } from "react";
import localFont from "next/font/local";
import "./admin.css";
import Topbar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";

// Path must match your directory structure
const cofoRaffine = localFont({
  src: "../../../public/fonts/OPED-FONTS-OTF/61238.otf", 
  variable: "--font-cofo",
  display: "swap",
});

const tenez = localFont({
  src: "../../../public/fonts/Tenez-Font-for-Blog-posts/35997.ttf",
  variable: "--font-tenez",
  display: "swap",
});

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  // State types inferred as boolean
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  return (
    <html lang="en">
      <body className={`${cofoRaffine.variable} ${tenez.variable} antialiased`}>
        {/* Changed background to white and text to black */}
        <div className="flex bg-[#FFFFFF]  text-black min-h-screen">
          
          <Sidebar
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
          />

          <main
            className={`
              flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out bg-white
              ${isCollapsed ? "lg:ml-20" : "lg:ml-72"}
            `}
          >
            <Topbar 
              toggleMobileMenu={() => setIsOpen(true)}
            />

            <div className="p-4 lg:p-8 animate-in fade-in duration-500">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}