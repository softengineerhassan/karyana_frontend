import { AppButton } from "@/Shared";
import { LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "@/store/slices/AuthSlice";
import toast from "react-hot-toast";

export default function LogoutButton() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    dispatch(logout());
    toast.success(t("You have been logged out."));
    navigate("/SignIn");
  };

  return (
    <AppButton
      variant="outline"
      fullWidth
      onClick={handleLogout}
      className="border-gold-danger/30 text-gold-danger bg-gold-danger/5 hover:bg-gold-danger/10 h-[54px]"
    >
      <LogOut className="w-5 h-5" />
      {t("Logout")}
    </AppButton>
  );
}
