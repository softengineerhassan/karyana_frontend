import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import POSLayout from "@/Layouts/POSLayout";
import { SignIn } from "@/Pages/Auth/SignIn";
import { SignUp } from "@/Pages/Auth/SignUp";
import { ForgotPassword } from "@/Pages/Auth/ForgotPassword";
import { VerifyOtp } from "@/Pages/Auth/VerifyOtp";
import { VerifyResetOtp } from "@/Pages/Auth/VerifyResetOtp";
import { ResetPassword } from "@/Pages/Auth/ResetPassword";
import DashboardPage from "@/Pages/POS/DashboardPage";
import ProfileSetupPage from "@/Pages/POS/ProfileSetupPage";
import InventoryPage from "@/Pages/POS/InventoryPage";
import CustomersPage from "@/Pages/POS/CustomersPage";
import SalesPage from "@/Pages/POS/SalesPage";
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
        <Route path="/login" element={<SignIn />} />
        <Route path="/register" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/verify-reset-otp" element={<VerifyResetOtp />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route
          path="/pos"
          element={token ? <POSLayout /> : <Navigate to="/login" replace />}
        >
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="profile" element={<ProfileSetupPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="sales" element={<SalesPage />} />
          <Route path="riders" element={<RidersPage />} />
          <Route path="rider-items" element={<RiderPurchaseItemsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
