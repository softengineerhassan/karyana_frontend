import {
  User, Heart, Star, Bell, Lock, HelpCircle, ChevronRight
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const items = [
  { icon: User, key: "Edit Profile", path: "/profile/edit" },
  { icon: Heart, key: "My Favorites", path: "/favorites" },
  { icon: Star, key: "My Reviews", path: "/profile/reviews" },
  { icon: Bell, key: "Notifications", path: "/profile/notifications" },
  { icon: Lock, key: "Privacy & Security", path: "/profile/privacy" },
  { icon: HelpCircle, key: "Help & Support", path: "/profile/help" },
];

export default function ProfileMenu() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleClick = (path) => {
    if (path) {
      navigate(path);
    }
  };

  return (
    <div className="space-y-2">
      {items.map((item, i) => {
        const Icon = item.icon;
        return (
          <button
            key={i}
            onClick={() => handleClick(item.path)}
            className="w-full bg-white border border-gold-primary/15 rounded-2xl p-4 flex items-center justify-between hover:border-gold-primary/40 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 bg-gold-primary/10 rounded-2xl flex items-center justify-center">
                <Icon className="w-5 h-5 text-gold-primary" />
              </div>
              <span className="font-semibold text-foreground">
                {t(item.key)}
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-luxury-gray" />
          </button>
        );
      })}
    </div>
  );
}
