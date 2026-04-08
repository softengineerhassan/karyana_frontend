import TopNav from "@/Navigation/TopNav";
import React from "react";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <TopNav />

      {/* Main Page Content */}
      <main className="min-h-screen bg-background overflow-x-hidden pt-20 pb-24 md:pb-0">
        <Outlet />
      </main>
    </div>
  );
}
