import React, { useEffect } from "react";
import AdminNavbar from "../../components/admin/AdminNavbar";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { Outlet } from "react-router-dom";
import "./style.scss";
import { useAppContext } from "../../context/AppContext";
import Spinner from "../../components/spinner/Spinner";

function Layout() {
  const { isAdmin, fetchIsAdmin } = useAppContext();

  useEffect(() => {
    fetchIsAdmin();
  }, []);
  return isAdmin ? (
    <>
      <AdminNavbar />
      <div className="admin-container">
        <AdminSidebar />
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </>
  ) : (
    <div className="spinner-fullscreen">
      <Spinner />
    </div>
  );
}

export default Layout;
