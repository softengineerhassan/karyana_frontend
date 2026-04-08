import axios from "axios";
import { API_BASE  } from "@/config";

const Axios = axios.create({
  baseURL: API_BASE,
  headers: {
    Accept: "application/json",
    "ngrok-skip-browser-warning": "69420"
  },
});

export default Axios;
