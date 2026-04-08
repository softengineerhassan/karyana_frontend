import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import POSLayout from "@/Layouts/POSLayout";
import LoginPage from "@/Pages/POS/LoginPage";
import DashboardPage from "@/Pages/POS/DashboardPage";
import ProfileSetupPage from "@/Pages/POS/ProfileSetupPage";
import RidersPage from "@/Pages/POS/RidersPage";
import RiderPurchaseItemsPage from "@/Pages/POS/RiderPurchaseItemsPage";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function AppRoutes() {
  const token = useSelector((state) => state?.auth?.token);

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Navigate to={token ? "/pos/dashboard" : "/login"} replace />} />
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/pos"
          element={token ? <POSLayout /> : <Navigate to="/login" replace />}
        >
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="profile" element={<ProfileSetupPage />} />
          <Route path="riders" element={<RidersPage />} />
          <Route path="rider-items" element={<RiderPurchaseItemsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
