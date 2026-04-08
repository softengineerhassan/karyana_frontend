import toast from "react-hot-toast";
import Axios from "../Services/axios";

export const fetchData = async (method = "POST", url, payload = {}) => {
  try {
    const isFormData = payload instanceof FormData;

    const config = {
      headers: {},
    };

    if (!isFormData) {
      config.headers["Content-Type"] = "application/json";
    }

    const methods = {
      POST: () => Axios.post(url, payload, config),
      GET: () => Axios.get(url, config),
      PUT: () => Axios.put(url, payload, config),
      PATCH: () => Axios.patch(url, payload, config),
      DELETE: () => Axios.delete(url, config),
    };

    if (methods[method]) {
      const response = await methods[method]();
      return response?.data;
    } else {
      throw new Error(`Unsupported HTTP method: ${method}`);
    }
  } catch (error) {
    console.error("Fetch Error:", error);

    toast.error(
      error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        `Something went wrong`
    );

    throw error;
  }
};
