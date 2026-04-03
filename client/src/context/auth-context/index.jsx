import { initalSignInFormData, initalSignUpFormData } from "@/config";
import {
  checkAuthService,
  loginService,
  logoutService,
  registerService,
} from "@/services";
import { createContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import Loader from "../../components/common/loader";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { normalizeUser } from "@/utils/role";

export const AuthContext = createContext(null);

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isValidEmail = (email) => emailRegex.test(email);
const isEmailOrUserName = (value) => {
  const trimmed = String(value || "").trim();
  if (!trimmed) return false;
  return trimmed.includes("@") ? isValidEmail(trimmed) : true;
};

export default function AuthProvider({ children }) {
  const [signInFormData, setSignInFormData] = useState(initalSignInFormData);
  const [signUpFormData, setSignUpFormData] = useState(initalSignUpFormData);
  const [auth, setAuth] = useState({ authenticated: false, user: null });
  const [loading, setLoading] = useState(true);

  const handleRegisterUser = async (event) => {
    event.preventDefault();

    const { userName, userEmail, userPassword, role } = signUpFormData;
    const trimmedEmail = (userEmail || "").trim();
    const trimmedUserName = (userName || "").trim();

    if (!trimmedUserName || !trimmedEmail || !userPassword || !role) {
      toast.error("All fields are required");
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (userPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    try {
      setLoading(true);
      const data = await registerService({
        ...signUpFormData,
        userName: trimmedUserName,
        userEmail: trimmedEmail,
      });

      if (data.success) {
        const user = normalizeUser(data.user || data.newUser);
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("user", JSON.stringify(user));

        toast.success("Registration successful!", { autoClose: 800 });

        setAuth({
          authenticated: true,
          user,
        });
      } else {
        toast.error(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Error in registering user", error);
      toast.error(
        error?.response?.data?.message ||
          "Registration failed: backend is not reachable",
      );
    } finally {
      setLoading(false);
      setSignUpFormData(initalSignUpFormData);
    }
  };

  const handleloginUser = async (event) => {
    event.preventDefault();
    setLoading(true);

    const { userEmail, userPassword } = signInFormData;
    const trimmedEmail = (userEmail || "").trim();

    if (!trimmedEmail || !userPassword) {
      toast.error("Email and password are required");
      setLoading(false);
      return;
    }

    if (!isEmailOrUserName(trimmedEmail)) {
      toast.error("Please enter a valid email or username");
      setLoading(false);
      return;
    }

    try {
      const data = await loginService({
        ...signInFormData,
        userEmail: trimmedEmail,
      });
      if (data.success) {
        const user = normalizeUser(data.user || data.newUser);
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("user", JSON.stringify(user));

        toast.success("Login successful!", { autoClose: 800 });

        setAuth({
          authenticated: true,
          user,
        });
      } else {
        toast.error(data.message || "Login failed");
        setAuth({
          authenticated: false,
          user: null,
        });
      }
    } catch (error) {
      console.error("Error logging in the user", error);
      toast.error(
        error?.response?.data?.message ||
          "Login failed: backend is not reachable",
      );
    } finally {
      setLoading(false);
      setSignInFormData(initalSignInFormData);
    }
  };

  const checkAuthUser = async () => {
    try {
      const data = await checkAuthService();
      if (data.success) {
        const user = normalizeUser(data.user);
        setAuth({
          authenticated: true,
          user,
        });
        setLoading(false);
      } else {
        setAuth({
          authenticated: false,
          user: null,
        });
        setLoading(false);
      }
    } catch (error) {
      // If the backend returns a real error (500, etc.), handle it silently for the check-auth pulse
      setAuth({
        authenticated: false,
        user: null,
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthUser();
  }, []);

  const resetCredentials = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setAuth({ authenticated: false, user: null });
  };

  const updateAuthUser = (nextUser) => {
    const user = normalizeUser(nextUser);
    localStorage.setItem("user", JSON.stringify(user));
    setAuth((prev) => ({
      ...prev,
      user,
    }));
  };

  const logoutUser = async () => {
    try {
      await logoutService();
    } catch (error) {
      console.error("Logout API error", error);
      throw error;
    } finally {
      resetCredentials();
      sessionStorage.clear();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        signInFormData,
        setSignInFormData,
        signUpFormData,
        setSignUpFormData,
        handleRegisterUser,
        handleloginUser,
        auth,
        resetCredentials,
        updateAuthUser,
        logoutUser,
        loading,
      }}
    >
      {loading ? (
        <div className=" fixed inset-0 spinner-container flex flex-col items-center justify-center  ">
          <Loader />
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node,
};
