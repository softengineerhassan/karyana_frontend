import Axios from "./axios";
import { logout } from "@/store/slices/AuthSlice";

export default function setupAxios(store) {
  // Request interceptor - inject Bearer token
  Axios.interceptors.request.use((config) => {
    const token = store.getState()?.auth?.token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  // Response interceptor - handle 401 with token refresh
  Axios.interceptors.response.use(
    (res) => res,
    async (error) => {
      if (error?.response?.status === 401) {
        store.dispatch(logout());
      }

      return Promise.reject(error);
    }
  );
}
