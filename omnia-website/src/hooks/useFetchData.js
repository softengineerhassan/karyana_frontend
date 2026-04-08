import { fetchData } from "@/helpers/fetchData";
import { useState, useCallback } from "react";

const useFetchData = (isLab = false) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const executeFetch = useCallback(async (method, url, payload = {}) => {
    setLoading(true);
    try {
      const result = await fetchData(method, url, payload);
      result ? setData(result) : setData(null);
      return result;
    } catch (err) {
      setData(null);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, executeFetch };
};

export default useFetchData;
