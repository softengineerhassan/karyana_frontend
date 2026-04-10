import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { KeyRound, Mail } from "lucide-react";

import { forgotPasswordSchema } from "@/lib/validations";
import { AuthLayout } from "@/Layouts/AuthLayout";
import { AppButton, FormField } from "@/Shared";
import { sendOtp } from "@/store/slices/AuthSlice";

export const ForgotPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data) => {
    await dispatch(sendOtp({ payload: { email: data.email.trim().toLowerCase() }, navigate }));
  };

  return (
    <AuthLayout title="Forgot password" subtitle="Use your verified email to receive a reset OTP">
      <div className="mb-6 rounded-2xl border border-gold-primary/15 bg-white/80 p-4 text-sm text-luxury-text-dim shadow-sm">
        <KeyRound className="mb-2 h-5 w-5 text-gold-primary" />
        Reset OTP is sent only after your profile has a real email address.
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          name="email"
          placeholder="Email address"
          type="email"
          icon={Mail}
          register={register}
          error={errors.email?.message}
        />

        <AppButton className="h-[54px] w-full">Send reset OTP</AppButton>

        <p className="pt-3 text-center text-sm text-luxury-text-dim">
          <Link to="/login" className="font-semibold text-gold-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};
