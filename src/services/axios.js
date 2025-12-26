import axios from "axios";
import { toast } from "react-toastify";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    let access_token = localStorage.getItem("token");
    if (access_token && !config.headers["Authorization"]) {
      config.headers["Authorization"] = `Bearer ${access_token}`;
    }
    config.headers["Accept"] = "application/json";
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  function (response) {
    console.log(response);
    if (response.data.data?.redirect) {
      window.location = response.data.data.redirect;
    }

    if (response.data?.secret) {
      let token = atob(response.data?.secret);
      localStorage.setItem("token", token);
    }
    return response.data;
  },
  (error) => {
    const status = error.response?.status;
    const errorCode = error.response?.data?.code;

    if (status === 401 || status === 700) {
      if (status === 700 || errorCode === "SESSION_EXPIRED") {
        toast.error(
          status === 700 ? "Token verification failed" : "Session expired"
        );
        localStorage.removeItem("token");
        localStorage.removeItem("auth_user");
        window.location = "/login";
      } else if (errorCode === "INVALID_CREDENTIALS") {
        toast.error("Invalid username or password");
      } else {
        toast.error("Unauthorized access");
      }
    } else if ([400, 404, 409, 500].includes(status)) {
      console.error(error.response);
      toast.error(error.response.data.message);
    } else {
      toast.error("Network Error, Please Re-try after sometime");
    }

    return Promise.reject(error.response);
  }
);

export default axiosInstance;
