import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema } from "@/lib/validations";
import { Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AppButton, FormField } from "@/Shared";
import { AuthLayout } from "@/Layouts/AuthLayout";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { resetUserPass } from "@/store/slices/AuthSlice";

export const ResetPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.auth);

  const resetToken = location.state?.resetToken;

  // Redirect if no reset token
  useEffect(() => {
    if (!resetToken) {
      navigate("/SignIn", { replace: true });
    }
  }, [resetToken, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = (data) => {
    const payload = {
      new_password: data.password,
      token: resetToken,
    };
    dispatch(resetUserPass({ payload, navigate }));
  };

  return (
    <AuthLayout
      title={t("New Password")}
      subtitle={t("Create your new password")}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          name="password"
          type="password"
          placeholder={t("New Password")}
          icon={Lock}
          register={register}
          error={errors.password?.message}
        />
        <FormField
          name="confirmPassword"
          type="password"
          placeholder={t("Confirm Password")}
          icon={Lock}
          register={register}
          error={errors.confirmPassword?.message}
        />

        <AppButton loading={isLoading} className="h-[54px]">
          {t("Reset Password")}
        </AppButton>

        <p className="text-center text-luxury-text-dim text-base pt-4">
          <button
            type="button"
            onClick={() => navigate("/SignIn")}
            className="font-semibold cursor-pointer"
          >
            {t("Back to Sign In")}
          </button>
        </p>
      </form>
    </AuthLayout>
  );
};
