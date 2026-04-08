import { useState, useEffect, useCallback } from "react";
import Axios from "@/services/axios";

export default function useVouchers() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchVouchers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await Axios.get("/vouchers");
      const data = res?.data?.items || res?.data || [];
      setVouchers(Array.isArray(data) ? data : []);
      setError(null);
      return data;
    } catch (err) {
      setError(err);
      setVouchers([]);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  return { vouchers, loading, error, refetch: fetchVouchers };
}
