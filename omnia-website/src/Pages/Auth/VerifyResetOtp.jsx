import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { KeyRound, ShieldCheck } from "lucide-react";

import { AuthLayout } from "@/Layouts/AuthLayout";
import { AppButton } from "@/Shared";
import { verifyResetOtp } from "@/store/slices/AuthSlice";

export const VerifyResetOtp = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isLoading = useSelector((state) => state?.auth?.isLoading);
  const email = location.state?.email || "";
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) {
      navigate("/forgot-password", { replace: true });
    }
  }, [email, navigate]);

  useEffect(() => {
    if (countdown <= 0) return undefined;
    const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const code = useMemo(() => otp.join(""), [otp]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    await dispatch(verifyResetOtp({ payload: { email, code }, navigate }));
  };

  const maskedEmail = email
    ? `${email.slice(0, 2)}${"*".repeat(Math.max(email.length - 4, 1))}${email.slice(-2)}`
    : "";

  return (
    <AuthLayout title="Verify reset code" subtitle={`Enter the 4-digit code for ${maskedEmail}`}>
      <div className="mb-6 rounded-2xl border border-gold-primary/15 bg-white/80 p-4 text-sm text-luxury-text-dim shadow-sm">
        <ShieldCheck className="mb-2 h-5 w-5 text-gold-primary" />
        After verification, you can set a new password.
      </div>

      <div className="space-y-6">
        <div className="flex justify-center gap-3">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(event) => handleChange(index, event.target.value)}
              onKeyDown={(event) => handleKeyDown(index, event)}
              className="h-14 w-14 rounded-2xl border border-gold-primary/20 bg-white text-center text-2xl font-semibold text-foreground shadow-sm outline-none transition focus:border-gold-primary focus:ring-4 focus:ring-gold-primary/10"
            />
          ))}
        </div>

        <AppButton loading={isLoading} onClick={handleVerify} disabled={code.length !== 4} className="h-[54px] w-full">
          Verify code
        </AppButton>

        <div className="text-center text-sm text-luxury-text-dim">
          {countdown > 0 ? (
            <p>Try again in {countdown}s</p>
          ) : (
            <p className="text-xs text-luxury-text-dim">
              Go back to request a new code.
            </p>
          )}
        </div>

        <p className="pt-2 text-center text-sm text-luxury-text-dim">
          <Link to="/forgot-password" className="font-semibold text-gold-primary hover:underline">
            Back to forgot password
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};
