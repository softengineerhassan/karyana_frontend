import Axios from "@/Services/axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import toast from "react-hot-toast";

// POST /auth/login
export const userSignIn = createAsyncThunk(
  "auth/signIn",
  async (payload, thunkAPI) => {
    try {
      const res = await Axios.post("/auth/login", payload);
      if (res) {
        toast.success(res?.data?.message);
      }
      return res?.data;
    } catch (error) {
      toast.error(error?.response?.data?.message);
      return thunkAPI.rejectWithValue(error);
    }
  }
);

// POST /auth/register
export const userSignUp = createAsyncThunk(
  "auth/signUp",
  async ({ payload, navigate }, thunkAPI) => {
    try {
      const res = await Axios.post("/auth/register", payload);
      if (res) {
        toast.success("Sign up successful! Please verify OTP.");
        navigate("/verify-otp", { state: { email: payload.email } });
      }
      return res?.data;
    } catch (error) {
      toast.error(error?.response?.data?.message);
      return thunkAPI.rejectWithValue(error);
    }
  }
);

// POST /auth/forgot-password
export const sendOtp = createAsyncThunk(
  "auth/otp",
  async ({ payload, navigate }, thunkAPI) => {
    try {
      const res = await Axios.post("/auth/forgot-password", payload);
      if (res) {
        toast.success(res?.data?.message);
        navigate("/verify-otp", {
          state: { email: payload.email, isForgotPassword: true },
        });
      }
      return res?.data;
    } catch (error) {
      toast.error(error?.response?.data?.message);
      return thunkAPI.rejectWithValue(error);
    }
  }
);

// POST /auth/verify-otp (registration flow)
export const verifyOtp = createAsyncThunk(
  "auth/verify-otp",
  async ({ payload, navigate }, thunkAPI) => {
    try {
      const res = await Axios.post("/auth/verify-otp", payload);
      if (res) {
        toast.success(res?.data?.message);
        navigate("/SignIn");
      }
      return res?.data;
    } catch (error) {
      toast.error(error?.response?.data?.message);
      return thunkAPI.rejectWithValue(error);
    }
  }
);

// POST /auth/resend-otp
export const resendOtp = createAsyncThunk(
  "auth/resend-otp",
  async (payload, thunkAPI) => {
    try {
      const res = await Axios.post("/auth/resend-otp", payload);
      if (res) {
        toast.success(res?.data?.message || "OTP resent successfully!");
      }
      return res?.data;
    } catch (error) {
      toast.error(error?.response?.data?.message);
      return thunkAPI.rejectWithValue(error);
    }
  }
);

// POST /auth/verify-reset-otp (forgot password flow - returns reset_token)
export const verifyResetOtp = createAsyncThunk(
  "auth/verify-reset-otp",
  async ({ payload, navigate }, thunkAPI) => {
    try {
      const res = await Axios.post("/auth/verify-reset-otp", payload);
      if (res) {
        toast.success(res?.data?.message);
        const resetToken = res?.data?.data?.reset_token;
        navigate("/reset-password", { state: { resetToken } });
      }
      return res?.data;
    } catch (error) {
      toast.error(error?.response?.data?.message);
      return thunkAPI.rejectWithValue(error);
    }
  }
);

// POST /auth/reset-password
export const resetUserPass = createAsyncThunk(
  "auth/reset",
  async ({ payload, navigate }, thunkAPI) => {
    try {
      const res = await Axios.post("/auth/reset-password", payload);
      if (res) {
        toast.success(res?.data?.message || "Password reset successfully!");
        navigate("/SignIn");
      }
      return res?.data;
    } catch (error) {
      toast.error(error?.response?.data?.message);
      return thunkAPI.rejectWithValue(error);
    }
  }
);

// GET /auth/me
export const getProfile = createAsyncThunk(
  "auth/getProfile",
  async (_, thunkAPI) => {
    try {
      const res = await Axios.get("/auth/me");
      return res?.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

const initialState = {
  isLoading: false,
  user: null,
  token: null,
  refreshToken: null,
  roleData: null,
  permissions: [],
};

const AuthSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.isLoading = false;
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.roleData = null;
      state.permissions = [];
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setTokens: (state, action) => {
      state.token = action.payload.token;
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Sign In
      .addCase(userSignIn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload?.data?.user;
        state.token = action.payload?.data?.access_token;
        state.refreshToken = action.payload?.data?.refresh_token;
        state.permissions = action.payload?.data?.permissions || {};
        state.roleData = action.payload?.data?.Role;
      })
      .addCase(userSignIn.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(userSignIn.rejected, (state) => {
        state.isLoading = false;
      })
      // Sign Up
      .addCase(userSignUp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload?.data;
      })
      .addCase(userSignUp.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(userSignUp.rejected, (state) => {
        state.isLoading = false;
      })
      // Verify OTP
      .addCase(verifyOtp.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(verifyOtp.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifyOtp.rejected, (state) => {
        state.isLoading = false;
      })
      // Verify Reset OTP
      .addCase(verifyResetOtp.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(verifyResetOtp.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifyResetOtp.rejected, (state) => {
        state.isLoading = false;
      })
      // Send OTP (Forgot Password)
      .addCase(sendOtp.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(sendOtp.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(sendOtp.rejected, (state) => {
        state.isLoading = false;
      })
      // Reset Password
      .addCase(resetUserPass.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(resetUserPass.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(resetUserPass.rejected, (state) => {
        state.isLoading = false;
      })
      // Resend OTP
      .addCase(resendOtp.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(resendOtp.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(resendOtp.rejected, (state) => {
        state.isLoading = false;
      })
      // Get Profile
      .addCase(getProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload?.data;
      })
      .addCase(getProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProfile.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { logout, setUser, setTokens } = AuthSlice.actions;
export default AuthSlice.reducer;
