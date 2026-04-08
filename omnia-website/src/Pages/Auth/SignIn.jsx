import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validations";
import { Mail, Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AppButton, FormField } from "@/Shared";
import { useNavigate, useLocation } from "react-router-dom";
import { userSignIn, getProfile } from "@/store/slices/AuthSlice";
import { useDispatch, useSelector } from "react-redux";
import { AuthLayout } from "@/Layouts/AuthLayout";

export const SignIn = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const redirectTo = location.state?.redirectTo || "/home";
  const resourceId = location.state?.resourceId;
  const perk = location.state?.perk;
  const [loginSuccess, setLoginSuccess] = React.useState(false);
  const user = useSelector((state) => state.auth?.user);
  const { isLoading } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    const payload = {
      device_id: "web-app-v1.0",
      email: data.email,
      password: data.password,
    };
    const resultAction = await dispatch(userSignIn(payload));

    if (userSignIn.fulfilled.match(resultAction)) {
      const responseData = resultAction.payload;

      // Handle unverified user - redirect to OTP verification
      if (
        responseData?.success === false &&
        responseData?.details?.is_verified === false
      ) {
        navigate("/verify-otp", { state: { email: data.email } });
        return;
      }

      if (responseData?.success) {
        // Fetch fresh profile
        dispatch(getProfile());
        setLoginSuccess(true);
      }
    }
  };

  React.useEffect(() => {
    if (loginSuccess || user) {
      if (redirectTo.startsWith("/booking/") && (resourceId || perk)) {
        navigate(redirectTo, {
          replace: true,
          state: { resourceId, perk },
        });
      } else {
        navigate(redirectTo, { replace: true });
      }
    }
  }, [loginSuccess, user, navigate, redirectTo, resourceId, perk]);

  return (
    <AuthLayout title={t("Welcome Back")} subtitle={t("Sign in to continue")}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          name="email"
          placeholder={t("Email Address")}
          icon={Mail}
          register={register}
          error={errors.email?.message}
        />
        <FormField
          placeholder={t("Password")}
          name="password"
          type="password"
          icon={Lock}
          register={register}
          error={errors.password?.message}
        />

        <div className="text-right">
          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            className="text-gold-primary text-sm font-semibold cursor-pointer hover:underline"
          >
            {t("Forgot Password?")}
          </button>
        </div>

        <AppButton loading={isLoading} className="h-[54px]">
          {t("Sign In")}
        </AppButton>
        <p className="text-center text-luxury-text-dim text-sm pt-4">
          {t("Don't have an account?")}{" "}
          <button
            type="button"
            onClick={() => navigate("/Signup")}
            className="text-gold-primary font-semibold hover:underline cursor-pointer"
          >
            {t("Sign Up")}
          </button>
        </p>
      </form>
    </AuthLayout>
  );
};
