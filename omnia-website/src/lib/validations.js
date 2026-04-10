import { z } from "zod";

const employeeIdSchema = z
  .string()
  .min(1, "Employee ID is required")
  .max(10, "Employee ID must be at most 10 characters")
  .refine((value) => /[A-Za-z]/.test(value), {
    message: "Employee ID must include at least one letter",
  })
  .refine((value) => /\d/.test(value), {
    message: "Employee ID must include at least one digit",
  })
  .refine((value) => /[^A-Za-z0-9]/.test(value), {
    message: "Employee ID must include at least one special character",
  });

export const loginSchema = z.object({
  employee_id: employeeIdSchema,
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z.object({
  employee_id: employeeIdSchema,
  full_name: z.string().max(255).optional().or(z.literal("")),
  phone_number: z.string().min(5, "Phone number is too short").max(20).optional().or(z.literal("")),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const emailVerificationSchema = z.object({
  email: z.string().email("Invalid email address"),
  code: z.string().min(4, "OTP must be 4 digits").max(4, "OTP must be 4 digits"),
});

export const resetOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
  code: z.string().min(4, "OTP must be 4 digits").max(4, "OTP must be 4 digits"),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });