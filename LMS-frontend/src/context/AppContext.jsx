import { createContext, useContext, useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    localStorage.getItem("accessToken") || null,
  );

  const fetchUser = async () => {
    try {
      const { data } = await axiosInstance.get("/user/profile");
      if (data.success) setUser(data.user);
    } catch (error) {
      console.log(error.message);
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    if (token) fetchUser();
  }, [token]);

  return (
    <AppContext.Provider
      value={{ user, setUser, token, setToken, fetchUser, logout }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
