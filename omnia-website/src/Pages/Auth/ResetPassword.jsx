import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { KeyRound } from "lucide-react";

import { resetPasswordSchema } from "@/lib/validations";
import { AuthLayout } from "@/Layouts/AuthLayout";
import { AppButton, FormField } from "@/Shared";
import { resetUserPass } from "@/store/slices/AuthSlice";

export const ResetPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isLoading = useSelector((state) => state?.auth?.isLoading);
  const resetToken = location.state?.resetToken || "";

  useEffect(() => {
    if (!resetToken) {
      navigate("/forgot-password", { replace: true });
    }
  }, [resetToken, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data) => {
    const payload = {
      token: resetToken,
      new_password: data.password,
    };

    await dispatch(resetUserPass({ payload, navigate }));
  };

  return (
    <AuthLayout title="Create new password" subtitle="Set a new password for your account">
      <div className="mb-6 rounded-2xl border border-gold-primary/15 bg-white/80 p-4 text-sm text-luxury-text-dim shadow-sm">
        <KeyRound className="mb-2 h-5 w-5 text-gold-primary" />
        Use a strong password you have not used before.
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          name="password"
          type="password"
          placeholder="New Password"
          icon={KeyRound}
          register={register}
          error={errors.password?.message}
        />

        <FormField
          name="confirmPassword"
          type="password"
          placeholder="Confirm Password"
          icon={KeyRound}
          register={register}
          error={errors.confirmPassword?.message}
        />

        <AppButton loading={isLoading} className="h-[54px] w-full">
          Reset password
        </AppButton>

        <p className="pt-3 text-center text-sm text-luxury-text-dim">
          <Link to="/login" className="font-semibold text-gold-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};
