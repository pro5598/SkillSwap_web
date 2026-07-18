"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import axiosInstance from "../api/axios";
import { LoginFormData } from "../app/(auth)/login/schema";
import { RegisterFormData } from "../app/(auth)/register/schema";

interface User {
  id: string;
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
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (data: LoginFormData) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkSession = async () => {
    try {
      const response = await axiosInstance.get("/user/me");
      const resData = response.data;
      if (resData.data?.user) {
        setUser(resData.data.user);
      } else if (resData.data) {
        setUser(resData.data);
      } else {
        setUser(resData);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const login = async (data: LoginFormData) => {
    try {
      const response = await axiosInstance.post("/auth/login", data);
      const resData = response.data;
      if (resData.data?.user) {
        setUser(resData.data.user);
      } else if (resData.data) {
        setUser(resData.data);
      } else {
        setUser(resData);
      }
    } catch (error: any) {
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
      if (resData.data?.user) {
        setUser(resData.data.user);
      } else if (resData.data) {
        setUser(resData.data);
      } else {
        setUser(resData);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Registration failed";
      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
      setUser(null);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, checkSession }}>
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
