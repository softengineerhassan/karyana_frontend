import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { BadgeCheck, Users } from "lucide-react";

import { signupSchema } from "@/lib/validations";
import { AuthLayout } from "@/Layouts/AuthLayout";
import { AppButton, FormField } from "@/Shared";
import { userSignUp } from "@/store/slices/AuthSlice";

export const SignUp = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      employee_id: "",
      full_name: "",
      phone_number: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    const payload = {
      employee_id: data.employee_id.trim(),
      full_name: data.full_name?.trim() || null,
      phone_number: data.phone_number?.trim() || null,
      password: data.password,
    };

    await dispatch(userSignUp({ payload, navigate }));
  };

  return (
    <AuthLayout title="Create account" subtitle="Register with your employee ID and start using the POS">
      <div className="mb-6 grid grid-cols-2 gap-3 text-xs font-medium text-on-surface-variant">
        <div className="rounded-2xl border border-white/70 bg-white/85 p-3 shadow-sm">
          <BadgeCheck className="mb-2 h-5 w-5 text-primary" />
          Register once, then complete profile
        </div>
        <div className="rounded-2xl border border-white/70 bg-white/85 p-3 shadow-sm">
          <Users className="mb-2 h-5 w-5 text-primary" />
          Employee ID based login
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" autoComplete="off">
        <FormField
          name="employee_id"
          label="Employee ID"
          placeholder="Employee ID"
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

        <FormField
          name="full_name"
          label="Full Name (Optional)"
          placeholder="Full Name (Optional)"
          register={register}
          error={errors.full_name?.message}
          inputProps={{
            autoComplete: "off",
            autoCapitalize: "words",
            spellCheck: false,
            "data-lpignore": "true",
            "data-1p-ignore": "true",
            "data-form-type": "other",
          }}
        />

        <FormField
          name="phone_number"
          label="Phone Number"
          placeholder="Phone Number"
          register={register}
          error={errors.phone_number?.message}
          inputProps={{
            autoComplete: "off",
            inputMode: "tel",
            spellCheck: false,
            "data-lpignore": "true",
            "data-1p-ignore": "true",
            "data-form-type": "other",
          }}
        />

        <FormField
          name="password"
          label="Password"
          type="password"
          placeholder="Password"
          register={register}
          error={errors.password?.message}
          inputProps={{
            autoComplete: "new-password",
            "data-lpignore": "true",
            "data-1p-ignore": "true",
            "data-form-type": "other",
          }}
        />

        <AppButton className="h-[54px] w-full">Create account</AppButton>

        <p className="pt-3 text-center text-sm text-on-surface-variant">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};
