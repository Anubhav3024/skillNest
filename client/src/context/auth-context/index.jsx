import { initalSignInFormData, initalSignUpFormData } from "@/config";
import {
  checkAuthService,
  loginService,
  logoutService,
  registerService,
} from "@/services";
import { createContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { ClipLoader } from "react-spinners";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const AuthContext = createContext(null);

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isValidEmail = (email) => emailRegex.test(email);

export default function AuthProvider({ children }) {
  const [signInFormData, setSignInFormData] = useState(initalSignInFormData);
  const [signUpFormData, setSignUpFormData] = useState(initalSignUpFormData);
  const [auth, setAuth] = useState({ authenticated: false, user: null });
  const [loading, setLoading] = useState(true);

  const handleRegisterUser = async (event) => {
    event.preventDefault();

    const { userName, userEmail, userPassword, role } = signUpFormData;

    if (!userName || !userEmail || !userPassword || !role) {
      toast.error("All fields are required");
      return;
    }

    if (!isValidEmail(userEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (userPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    try {
      const data = await registerService(signUpFormData);

      if (data.success) {
        const user = data.user || data.newUser;
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("user", JSON.stringify(user));

        toast.success("Registration successful!", { autoClose: 800 });

        setAuth({
          authenticated: true,
          user: user,
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
      setSignUpFormData(initalSignUpFormData);
    }
  };

  const handleloginUser = async (event) => {
    event.preventDefault();
    setLoading(true);

    const { userEmail, userPassword } = signInFormData;

    if (!userEmail || !userPassword) {
      toast.error("Email and password are required");
      setLoading(false);
      return;
    }

    if (!isValidEmail(userEmail)) {
      toast.error("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      const data = await loginService(signInFormData);
      if (data.success) {
        const user = data.user || data.newUser;
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("user", JSON.stringify(user));

        toast.success("Login successful!", { autoClose: 800 });

        setAuth({
          authenticated: true,
          user: user,
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
        setAuth({
          authenticated: true,
          user: data.user,
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
      console.log("Authentication check error", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.status &&
        error.response.data.status === 401
      ) {
        setAuth({
          authenticated: false,
          user: null,
        });
      }
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
    localStorage.setItem("user", JSON.stringify(nextUser));
    setAuth((prev) => ({
      ...prev,
      user: nextUser,
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
          <ClipLoader color="#36D7B7" size={70} />
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
