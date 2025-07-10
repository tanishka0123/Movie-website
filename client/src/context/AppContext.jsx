import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const base_url = import.meta.env.VITE_BASE_URL || "http://localhost:3000";
  const [isAdmin, setIsAdmin] = useState(false);
  const [shows, setShows] = useState([]);

  const image_base_url = import.meta.env.VITE__TMDB_IMAGE_BASE_URL;

  const navigate = useNavigate();

  const { user } = useUser();
  const { getToken, isSignedIn } = useAuth();
  const location = useLocation();

  const fetchIsAdmin = async () => {
    try {
      if (!isSignedIn || !user) {
        setIsAdmin(false);
        return;
      }

      const token = await getToken();

      if (!token) {
        setIsAdmin(false);
        return;
      }

      const { data } = await axios.get(`${base_url}/api/admin/is-admin`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setIsAdmin(data.isAdmin);

      if (!data.isAdmin && location.pathname.startsWith("/admin")) {
        navigate("/");
        toast.error("You are not authorized to access admin dashboard");
      }
    } catch (error) {
      setIsAdmin(false);
      console.log(error.response?.status)
      if (error.response?.status === 401) {
        if (location.pathname.startsWith("/admin")) {
          navigate("/");
          toast.error("You are not authorized to access admin dashboard");
        }
      } else if (error.response?.status === 403) {
        if (location.pathname.startsWith("/admin")) {
          navigate("/");
          toast.error("You are not authorized to access admin dashboard");
        }
      }
    }
  };

  const fetchShows = async () => {
    try {
      const { data } = await axios.get(`${base_url}/api/show/all`);
      if (data.success) {
        setShows(data.shows);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log("fetchShows error:", error);
      toast.error("Failed to fetch shows");
    }
  };

  useEffect(() => {
    fetchShows();
  }, []);

  useEffect(() => {
    if (user && isSignedIn) {
      fetchIsAdmin();
    }
  }, [user, isSignedIn]);

  const value = { fetchIsAdmin, user, getToken, navigate, isAdmin, shows, image_base_url };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
