import React, { useEffect, useState } from "react";
import { FaChartLine } from "react-icons/fa6";
import { FaHandHoldingDollar } from "react-icons/fa6";
import { TfiVideoClapper } from "react-icons/tfi";
import { PiUsers } from "react-icons/pi";
import Spinner from "../../../components/spinner/Spinner";
import "./style.scss";
import { dateFormat } from "../../../lib/dateFormat";
import CircleRating from "../../../components/circleRating/CircleRating";
import { useAppContext } from "../../../context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";

function Dashboard() {
  const { getToken, user, image_base_url } = useAppContext();

  const currency = import.meta.env.VITE_CURRENCY;
  const [dashboardData, setDashboardData] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    totalUser: 0,
    activeShows: [],
  });
  const [loading, setLoading] = useState(true);
  const dashboardCards = [
    {
      title: "Total Bookings",
      value: dashboardData.totalBookings || "0",
      icon: FaChartLine,
    },
    {
      title: "Total Revenue",
      value: currency + (dashboardData.totalRevenue || "0"),
      icon: FaHandHoldingDollar,
    },
    {
      title: "Active Shows",
      value: dashboardData.activeShows.length || "0",
      icon: TfiVideoClapper,
    },
    {
      title: "Total Users",
      value: dashboardData.totalUser || "0",
      icon: PiUsers,
    },
  ];
  const fetchDashBoardData = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:3000/api/admin/dashboard",
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      );
      if (data.success) {
        setDashboardData(data.dashboardData);
        setLoading(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Error fetching dashboard data");
    }
  };
  useEffect(() => {
    if (user) {
      fetchDashBoardData();
    }
  }, [user]);
  return !loading ? (
    <div className="dashboard">
      <h1 className="admin-title">Admin Dashboard</h1>
      <div className="blur-circle1" />
      <div className="blur-circle2" />
      <div className="dashboard-cards">
        {dashboardCards.map((card, index) => (
          <div key={index} className="dashboard-card">
            <div className="card-info">
              <h1>{card.title}</h1>
              <p>{card.value}</p>
            </div>
            <card.icon className="card-icon" />
          </div>
        ))}
      </div>
      <p className="admin-subtitle">Active shows</p>
      <div className="showcards">
        {dashboardData.activeShows.map((show) => {
          return (
            <div className="active-shows">
              <div key={show._id} className="show-card">
                <img src={image_base_url + show.movie.poster_path} alt="" />
                <CircleRating rating={show.movie.vote_average.toFixed(1)} />
                <p className="price">
                  {currency} {show.showPrice}
                </p>
              </div>
              <div className="show-details">
                <p className="show-title">{show.movie.title}</p>
                <p className="show-date">{dateFormat(show.showDateTime)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  ) : (
    <div className="spinner-fullscreen">
      <Spinner />
    </div>
  );
}

export default Dashboard;
