import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { FiChevronLeft } from "react-icons/fi";
import { MdOutlineDashboard } from "react-icons/md";
import { GrChapterAdd } from "react-icons/gr";
import { RiPlayList2Line } from "react-icons/ri";
import { GoChecklist } from "react-icons/go";
import { FiUsers } from "react-icons/fi";
import "./adminSidebar.scss"
import profilePic from "../../assets/avatar.png";

const adminLinks = [
  { name: "Dashboard", path: "/admin", icon: <MdOutlineDashboard /> },
  { name: "Add-Shows", path: "/admin/add-shows", icon: <GrChapterAdd /> },
  { name: "List Shows", path: "/admin/list-shows", icon: <RiPlayList2Line /> },
  {
    name: "List Bookings",
    path: "/admin/list-bookings",
    icon: <GoChecklist />,
  },
  {
    name: "User Controls",
    path: "/admin/user-controls",
    icon: <FiUsers />,
  },
];

function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <div className={`admin-sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="toggle-btn" onClick={() => setCollapsed(!collapsed)}>
        <FiChevronLeft />
      </div>

      {/* Profile Picture */}
      <div className="profile-section">
        <img src={profilePic} alt="Admin" className="profile-img" />
      </div>

      {/* Navigation Links */}
      <ul className="nav-links">
        {adminLinks.map((item, idx) => (
          <li key={idx}>
            <NavLink
              to={item.path}
              className={({ isActive }) => `link ${isActive ? "active" : ""}`}
              end
            >
              <div className="icons">{item.icon}</div>
              <span className="link-text">{item.name}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminSidebar;