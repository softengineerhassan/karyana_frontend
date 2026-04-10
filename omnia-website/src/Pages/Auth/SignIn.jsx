import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { Eye, EyeOff, KeyRound, ShieldCheck, Users } from "lucide-react";

import { loginSchema } from "@/lib/validations";
import { AuthLayout } from "@/Layouts/AuthLayout";
import { AppButton, FormField } from "@/Shared";
import { userSignIn } from "@/store/slices/AuthSlice";

export const SignIn = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector((state) => state?.auth?.token);
  const isLoading = useSelector((state) => state?.auth?.isLoading);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      employee_id: "",
      password: "",
    },
  });

  if (token) {
    return <Navigate to="/pos/dashboard" replace />;
  }

  const onSubmit = async (data) => {
    const payload = {
      employee_id: data.employee_id.trim(),
      password: data.password,
      device_id: "web-pos-v1",
      fcm_token: null,
    };

    try {
      await dispatch(userSignIn(payload)).unwrap();
      navigate("/pos/dashboard", { replace: true });
    } catch {
      // toast is handled in thunk
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in with your employee ID to manage your terminal"
    >
      <div className="mb-6 grid grid-cols-3 gap-3 text-xs font-medium text-on-surface-variant">
        <div className="rounded-2xl border border-white/70 bg-white/85 p-3 text-center shadow-sm">
          <ShieldCheck className="mx-auto mb-2 h-5 w-5 text-primary" />
          Secure login
        </div>
        <div className="rounded-2xl border border-white/70 bg-white/85 p-3 text-center shadow-sm">
          <Users className="mx-auto mb-2 h-5 w-5 text-primary" />
          Rider flows
        </div>
        <div className="rounded-2xl border border-white/70 bg-white/85 p-3 text-center shadow-sm">
          <KeyRound className="mx-auto mb-2 h-5 w-5 text-primary" />
          Password recovery
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" autoComplete="off">
        <FormField
          name="employee_id"
          label="Employee ID"
          placeholder="Enter employee ID"
          register={register}
          error={errors.employee_id?.message}
          inputProps={{
            autoComplete: "off",
            autoCapitalize: "none",
            spellCheck: false,
            "data-lpignore": "true",
            "data-1p-ignore": "true",
            "data-form-type": "other",
          }}
        />

        <div className="relative">
          <FormField
            name="password"
            label="Password"
            placeholder="Enter password"
            type={showPassword ? "text" : "password"}
            register={register}
            error={errors.password?.message}
            className="pr-11"
            inputProps={{
              autoComplete: "new-password",
              "data-lpignore": "true",
              "data-1p-ignore": "true",
              "data-form-type": "other",
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-4 top-[42px] rounded-md p-1 text-on-surface-variant hover:text-on-surface"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <div className="flex items-center justify-between gap-3 text-sm">
          
          <Link to="/forgot-password" className="font-semibold text-primary hover:underline">
            Forgot password?
          </Link>
        </div>

        <AppButton loading={isLoading} className="h-[54px] w-full">
          Sign In
        </AppButton>

        <p className="pt-3 text-center text-sm text-on-surface-variant">
          New user?{" "}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Create account
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};
