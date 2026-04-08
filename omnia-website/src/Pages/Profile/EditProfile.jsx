import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "@/store/slices/AuthSlice";
import { fetchData } from "@/helpers/fetchData";
import toast from "react-hot-toast";
import { ArrowLeft, User, Mail, Phone, Camera, Loader2, Trash2 } from "lucide-react";

export default function EditProfile() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth?.user);
  const fileInputRef = useRef(null);

  const [fullName, setFullName] = useState(user?.full_name || "");
  const [phone, setPhone] = useState(user?.phone_number || "");
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user?.profile_picture_url || null);
  const [removePhoto, setRemovePhoto] = useState(false); // tracked for future API support
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const email = user?.email || "";

  // Validation
  const validate = () => {
    const newErrors = {};

    if (!fullName.trim()) {
      newErrors.fullName = t("Full name is required");
    } else if (fullName.trim().length > 15) {
      newErrors.fullName = t("Name cannot exceed 15 characters");
    } else if (!/^[a-zA-Z\s]+$/.test(fullName.trim())) {
      newErrors.fullName = t("Name can only contain letters and spaces");
    }

    if (phone.trim() && phone.trim().length > 11) {
      newErrors.phone = t("Phone number cannot exceed 11 digits");
    } else if (phone.trim() && !/^[0-9]+$/.test(phone.trim())) {
      newErrors.phone = t("Phone number can only contain numbers");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Image picker
  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      setPreviewUrl(URL.createObjectURL(file));
      setRemovePhoto(false);
    }
  };

  const handleRemovePhoto = () => {
    setProfilePicture(null);
    setPreviewUrl(null);
    setRemovePhoto(true);
  };

  // Save — matching customer app's updateProfile() exactly
  const handleSave = async () => {
    if (!validate()) return;

    setIsSaving(true);
    try {
      const formData = new FormData();
      // Field names must be snake_case to match API (same as customer app)
      formData.append("full_name", fullName.trim());
      if (phone.trim()) {
        formData.append("phone_number", phone.trim());
      }
      if (profilePicture) {
        formData.append("profile_picture", profilePicture, profilePicture.name);
      }

      const result = await fetchData("PUT", "/users/me/profile", formData);

      // API returns { success, data: { ...updatedUser } }
      // fetchData returns the envelope, so result.data is the user object
      const updatedUser = result?.data;
      if (updatedUser) {
        dispatch(setUser(updatedUser));
        toast.success(t("Profile updated successfully!"));
        navigate(-1);
      } else {
        // Fallback: manually update local state if API didn't return user
        dispatch(setUser({
          ...user,
          full_name: fullName.trim(),
          phone_number: phone.trim(),
          profile_picture_url: removePhoto ? null : (previewUrl || user?.profile_picture_url),
        }));
        toast.success(t("Profile updated successfully!"));
        navigate(-1);
      }
    } catch {
      // fetchData already shows toast error
    } finally {
      setIsSaving(false);
    }
  };

  // Initials
  const initials = fullName
    ? fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "";

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-24">
      {/* Header */}
      <div className="bg-white border-b border-[#E8E3D5] p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-11 h-11 border border-[#E8E3D5] rounded-2xl flex items-center justify-center text-[#8B8680] hover:text-[#1A1A1C] hover:border-[#D4AF37]/40 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1
              className="text-2xl text-[#1A1A1C]"
              style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 600 }}
            >
              {t("Edit Profile")}
            </h1>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#CD7F32] text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSaving ? t("Saving...") : t("Save")}
          </button>
        </div>
      </div>

      {/* Profile Picture Section */}
      <div className="px-6 py-8">
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Profile"
                className="w-28 h-28 rounded-full object-cover shadow-lg border-2 border-[#E8E3D5]"
              />
            ) : (
              <div className="w-28 h-28 bg-gradient-to-br from-[#D4AF37] to-[#CD7F32] rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                {initials || <User className="w-12 h-12" />}
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-10 h-10 bg-white border-2 border-[#D4AF37] rounded-full flex items-center justify-center shadow-md hover:bg-[#D4AF37]/10 transition-all cursor-pointer"
            >
              <Camera className="w-5 h-5 text-[#D4AF37]" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>
          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-[#D4AF37] text-sm font-medium hover:underline cursor-pointer"
            >
              {t("Upload Photo")}
            </button>
            {previewUrl && (
              <>
                <span className="text-[#E8E3D5]">|</span>
                <button
                  onClick={handleRemovePhoto}
                  className="text-red-400 text-sm font-medium hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {t("Remove")}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4 max-w-2xl mx-auto">
          {/* Full Name */}
          <div className={`bg-white border rounded-2xl p-4 transition-all ${errors.fullName ? 'border-red-400' : 'border-[#E8E3D5] focus-within:border-[#D4AF37]/60'}`}>
            <label className="flex items-center gap-2 text-xs text-[#8B8680] uppercase tracking-wider mb-2">
              <User className="w-4 h-4" />
              {t("Full Name")} <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => { setFullName(e.target.value); setErrors((p) => ({ ...p, fullName: undefined })); }}
              maxLength={15}
              className="w-full text-[#1A1A1C] font-medium bg-transparent outline-none text-lg"
              placeholder={t("Enter your full name")}
            />
            {errors.fullName && <p className="text-red-400 text-xs mt-1.5">{errors.fullName}</p>}
            <p className="text-[#A5A09A] text-xs mt-1 text-right">{fullName.length}/15</p>
          </div>

          {/* Email (Read-only) */}
          <div className="bg-[#F5F2ED] border border-[#E8E3D5] rounded-2xl p-4 opacity-70">
            <label className="flex items-center gap-2 text-xs text-[#8B8680] uppercase tracking-wider mb-2">
              <Mail className="w-4 h-4" />
              {t("Email Address")}
            </label>
            <input
              type="email"
              value={email}
              readOnly
              className="w-full text-[#8B8680] font-medium bg-transparent outline-none text-lg cursor-not-allowed"
            />
            <p className="text-[#A5A09A] text-xs mt-1">{t("Email cannot be changed")}</p>
          </div>

          {/* Phone */}
          <div className={`bg-white border rounded-2xl p-4 transition-all ${errors.phone ? 'border-red-400' : 'border-[#E8E3D5] focus-within:border-[#D4AF37]/60'}`}>
            <label className="flex items-center gap-2 text-xs text-[#8B8680] uppercase tracking-wider mb-2">
              <Phone className="w-4 h-4" />
              {t("Phone Number")}
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setErrors((p) => ({ ...p, phone: undefined })); }}
              maxLength={11}
              className="w-full text-[#1A1A1C] font-medium bg-transparent outline-none text-lg"
              placeholder={t("Enter your phone number")}
            />
            {errors.phone && <p className="text-red-400 text-xs mt-1.5">{errors.phone}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
