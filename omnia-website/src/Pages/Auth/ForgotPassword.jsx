import { AuthLayout } from "@/Layouts/AuthLayout";
import { AppButton, FormField } from "@/Shared";
import { Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema } from "@/lib/validations";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { sendOtp } from "@/store/slices/AuthSlice";

export const ForgotPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = (data) => {
    dispatch(sendOtp({ payload: { email: data.email }, navigate }));
  };

  return (
    <AuthLayout
      title={t("Reset Password")}
      subtitle={t("Enter your email to receive a reset OTP")}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          name="email"
          type="email"
          placeholder={t("Email Address")}
          icon={Mail}
          register={register}
          error={errors.email?.message}
        />

        <AppButton loading={isLoading} className="h-[54px]">
          {t("Send Reset OTP")}
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
