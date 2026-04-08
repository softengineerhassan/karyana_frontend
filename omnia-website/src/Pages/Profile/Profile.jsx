import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getProfile } from "@/store/slices/AuthSlice";
import ProfileHeader from "./components/ProfileHeader";
import ProfileStats from "./components/ProfileStats";
import MembershipCard from "./components/MembershipCard";
import ProfileMenu from "./components/ProfileMenu";
import LanguageToggle from "./components/LanguageToggle";
import LogoutButton from "./components/LogoutButton";

export default function Profile() {
  const dispatch = useDispatch();

  // Fetch fresh profile data on mount
  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-24">

      <div className="bg-gradient-to-br from-[#D4AF37] to-[#CD7F32] text-white p-6 pb-20 rounded-b-[2rem] shadow-xl">
        <ProfileHeader />
        <ProfileStats />
      </div>

      <div className="px-6 -mt-12 mb-6">
        <MembershipCard />
      </div>

      <div className="px-6 mb-6">
        <ProfileMenu />
      </div>

      <div className="px-6 mb-6">
        <LanguageToggle />
      </div>

      <div className="px-6">
        <LogoutButton />
      </div>

    </div>
  );
}
