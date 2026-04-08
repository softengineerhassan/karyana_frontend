import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "@/lib/validations";
import { Mail, Lock, User, Phone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AppButton, FormField } from "@/Shared";
import { AuthLayout } from "@/Layouts/AuthLayout";
import { userSignUp } from "@/store/slices/AuthSlice";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

export const SignUp = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const dispatch = useDispatch();
  const onSubmit = (data) => {
    const payload = {
      email: data.email,
      full_name: data.name,
      password: data.password,
      phone_number: data.phone,
      role_id: "b4c8b079-8ad2-4a3f-91cf-92854e24043f"
    };
    dispatch(userSignUp({ payload, navigate }));
  };
  return (
    <AuthLayout title={t("Create Account")} subtitle={t("Join OMNIA today")}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          name="name"
          placeholder={t("Full Name")}
          icon={User}
          register={register}
          error={errors.name?.message}
        />
        <FormField
          name="phone"
          placeholder={t("Phone Number")}
          icon={Phone}
          register={register}
          error={errors.phone?.message}
        />
        <FormField
          name="email"
          placeholder={t("Email Address")}
          icon={Mail}
          register={register}
          error={errors.email?.message}
        />
        <FormField
          name="password"
          type="password"
          placeholder={t("Password")}
          icon={Lock}
          register={register}
          error={errors.password?.message}
        />

        <AppButton loading={isSubmitting} className="h-[54px]">
          {t("Sign Up")}
        </AppButton>

        <p className="text-center text-luxury-text-dim text-sm pt-4">
          {t("Already have an account?")}{" "}
          <button
            type="button"
            onClick={() => navigate("/SignIn")}
            className="text-gold-primary font-semibold hover:underline cursor-pointer"
          >
            {t("Sign In")}
          </button>
        </p>

      </form>
    </AuthLayout>
  );
};
