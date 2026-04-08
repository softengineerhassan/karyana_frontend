import { Mail } from "lucide-react";
import { useSelector } from "react-redux";

export default function ProfileHeader() {
  const user = useSelector((state) => state.auth?.user);

  const fullName = user?.full_name || "";
  const email = user?.email || "";
  const profilePictureUrl = user?.profile_picture_url;

  // Generate initials from name
  const getInitials = (name) => {
    if (!name) return "";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    if (parts[0].length > 1) {
      return (parts[0][0] + parts[0][1]).toUpperCase();
    }
    return parts[0][0]?.toUpperCase() || "";
  };

  const initials = getInitials(fullName);

  return (
    <div className="flex items-center gap-4 mb-6">
      {profilePictureUrl ? (
        <img
          src={profilePictureUrl}
          alt={fullName}
          className="w-20 h-20 rounded-3xl object-cover shadow-lg border-2 border-white/20"
          onError={(e) => {
            e.target.style.display = "none";
            e.target.nextSibling.style.display = "flex";
          }}
        />
      ) : null}
      <div
        className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-3xl font-bold shadow-lg tracking-wider"
        style={{ display: profilePictureUrl ? "none" : "flex" }}
      >
        {initials}
      </div>
      <div>
        <h2 className="text-2xl font-semibold font-serif">
          {fullName || "User"}
        </h2>
        {email && (
          <p className="text-white/80 text-sm flex items-center gap-2">
            <Mail className="w-4 h-4" />
            {email}
          </p>
        )}
      </div>
    </div>
  );
}
