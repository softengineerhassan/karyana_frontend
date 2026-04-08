import React, { useState, useRef, useEffect, useCallback } from "react";
import { AuthLayout } from "@/Layouts/AuthLayout";
import { AppButton } from "@/Shared";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  verifyOtp,
  verifyResetOtp,
  resendOtp,
} from "@/store/slices/AuthSlice";

export const VerifyOtp = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.auth);

  const email = location.state?.email;
  const isForgotPassword = location.state?.isForgotPassword || false;

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef([]);

  // Redirect if no email in state
  useEffect(() => {
    if (!email) {
      navigate("/SignIn", { replace: true });
    }
  }, [email, navigate]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Move to previous input on backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{4}$/.test(pastedData)) {
      const digits = pastedData.split("");
      setOtp(digits);
      inputRefs.current[3]?.focus();
    }
  };

  const handleVerify = useCallback(() => {
    const otpCode = otp.join("");
    if (otpCode.length !== 4) return;

    const payload = { email, otp: otpCode };

    if (isForgotPassword) {
      dispatch(verifyResetOtp({ payload, navigate }));
    } else {
      dispatch(verifyOtp({ payload, navigate }));
    }
  }, [otp, email, isForgotPassword, dispatch, navigate]);

  const handleResend = () => {
    if (countdown > 0) return;
    dispatch(resendOtp({ email }));
    setCountdown(60);
    setOtp(["", "", "", ""]);
    inputRefs.current[0]?.focus();
  };

  // Mask email for display
  const maskedEmail = email
    ? email.replace(/(.{2})(.*)(@.*)/, (_, start, middle, end) => {
        return start + "*".repeat(middle.length) + end;
      })
    : "";

  return (
    <AuthLayout
      title={t("Verify OTP")}
      subtitle={`${t("Enter the code sent to")} ${maskedEmail}`}
    >
      <div className="space-y-8">
        {/* OTP Input Fields */}
        <div className="flex justify-center gap-4" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-14 h-14 text-center text-2xl font-semibold border-2 border-luxury-border rounded-xl
                focus:border-gold-primary focus:ring-2 focus:ring-gold-primary/20 outline-none
                bg-white/80 text-luxury-text transition-all"
            />
          ))}
        </div>

        {/* Verify Button */}
        <AppButton
          loading={isLoading}
          onClick={handleVerify}
          disabled={otp.join("").length !== 4}
          className="h-[54px]"
        >
          {t("Verify")}
        </AppButton>

        {/* Resend OTP */}
        <div className="text-center">
          {countdown > 0 ? (
            <p className="text-luxury-text-dim text-sm">
              {t("Resend OTP in")}{" "}
              <span className="font-semibold text-gold-primary">
                {countdown}s
              </span>
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              className="text-gold-primary font-semibold text-sm hover:underline cursor-pointer"
            >
              {t("Resend OTP")}
            </button>
          )}
        </div>

        {/* Back to Sign In */}
        <p className="text-center text-luxury-text-dim text-base">
          <button
            type="button"
            onClick={() => navigate("/SignIn")}
            className="font-semibold cursor-pointer"
          >
            {t("Back to Sign In")}
          </button>
        </p>
      </div>
    </AuthLayout>
  );
};
