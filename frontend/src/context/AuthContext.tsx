"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import axiosInstance from "../api/axios";
import { LoginFormData } from "../app/(auth)/login/schema";
import { RegisterFormData } from "../app/(auth)/register/schema";

interface User {
  id: string;
  _id?: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  phoneNumber?: string;
  imageUrl?: string;
  role?: string;
  bio?: string;
  skillsOffered?: string[];
  skillsWanted?: string[];
  experienceLevel?: string;
  location?: string;
  availabilitySchedule?: string;
  subscriptionStatus?: "free" | "pro";
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (data: LoginFormData) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  googleLogin: (credential: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkSession = useCallback(async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("skillswap_auth_token") : null;
      if (token) {
        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }
      
      const response = await axiosInstance.get("/user/me");
      const resData = response.data;
      let userData = null;
      if (resData.data?.user) {
        userData = resData.data.user;
      } else if (resData.data) {
        userData = resData.data;
      } else {
        userData = resData;
      }
      // Normalize ID: ensure both id and _id are always set
      if (userData) {
        userData.id = userData.id || userData._id;
        userData._id = userData._id || userData.id;
        setUser(userData);
      }
    } catch (error) {
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem("skillswap_auth_token");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, []);

  const login = async (data: LoginFormData) => {
    try {
      const response = await axiosInstance.post("/auth/login", data);
      const resData = response.data;
      let userData = null;
      if (resData.data?.user) {
        userData = resData.data.user;
      } else if (resData.data) {
        userData = resData.data;
      } else {
        userData = resData;
      }
      if (userData) {
        userData.id = userData.id || userData._id;
        userData._id = userData._id || userData.id;
        setUser(userData);
      }
      
      if (resData.data?.token) {
        localStorage.setItem("skillswap_auth_token", resData.data.token);
        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${resData.data.token}`;
      }
    } catch (error: any) {
      if (!error.response) {
        throw new Error(
          "Unable to connect to the server. Make sure the backend is running (npm run dev in the backend folder)."
        );
      }
      const message = error.response?.data?.message || "Login failed";
      throw new Error(message);
    }
  };

  const register = async (data: RegisterFormData) => {
    try {
      // Removing confirmPassword as backend usually doesn't need it
      const { confirmPassword, ...registerData } = data;
      const response = await axiosInstance.post("/auth/register", registerData);
      const resData = response.data;
      let userData = null;
      if (resData.data?.user) {
        userData = resData.data.user;
      } else if (resData.data) {
        userData = resData.data;
      } else {
        userData = resData;
      }
      if (userData) {
        userData.id = userData.id || userData._id;
        userData._id = userData._id || userData.id;
        setUser(userData);
      }

      if (resData.data?.token) {
        localStorage.setItem("skillswap_auth_token", resData.data.token);
        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${resData.data.token}`;
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Registration failed";
      throw new Error(message);
    }
  };

  const googleLogin = async (credential: string) => {
    try {
      const response = await axiosInstance.post("/auth/google", { credential });
      const resData = response.data;
      let userData = null;
      if (resData.data?.user) {
        userData = resData.data.user;
      } else if (resData.data) {
        userData = resData.data;
      } else {
        userData = resData;
      }
      if (userData) {
        userData.id = userData.id || userData._id;
        userData._id = userData._id || userData.id;
        setUser(userData);
      }

      if (resData.data?.token) {
        localStorage.setItem("skillswap_auth_token", resData.data.token);
        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${resData.data.token}`;
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Google login failed";
      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem("skillswap_auth_token");
      }
      delete axiosInstance.defaults.headers.common["Authorization"];
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, googleLogin, logout, checkSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
