import React from "react";
import AdminNavbar from "../../components/admin/AdminNavbar";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { Outlet } from "react-router-dom";
import "./style.scss"; 

function Layout() {
  return (
    <>
      <AdminNavbar />
      <div className="admin-container">
        <AdminSidebar />
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </>
  );
}

export default Layout;
