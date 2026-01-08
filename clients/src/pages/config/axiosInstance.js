import axios from "axios";
import { toast } from "react-toastify";
import BASE_URL from "./config";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
     if (error.config?.skipAuthInterceptor) {
      return Promise.reject(error);
    }
    if (error.response?.status === 401) {
      const data = error.response.data;
      const message = data?.message?.toLowerCase() || "";

      const isInactive =
        message.includes("inactive") ||
        message.includes("deactivated") ||
        data?.logout === true;
      
      if (error.response?.data?.logout === true) {
  window.location.href = "/login";
}

     // ✅ ONLY SHOW MESSAGE (NO REDIRECT)
      // Check if we are already on the login page to avoid "Session expired" loop/spam
      const isLoginPage = window.location.pathname === "/login" || window.location.pathname === "/";

      if (isInactive) {
        toast.error("You are currently set Inactive by admin. Please contact admin.");
      } else if (!isLoginPage) {
        toast.error("Your session has expired. Please log in again.");
      }
    }

    return Promise.reject(error);
  }
);

export default api;
