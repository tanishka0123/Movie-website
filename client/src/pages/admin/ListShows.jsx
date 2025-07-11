import React, { useEffect, useState } from "react";
import Spinner from "../../components/spinner/Spinner";
import { dateFormat } from "../../lib/dateFormat";
import "./style.scss";
import { useAppContext } from "../../context/AppContext";
import axios from "axios";

function ListShows() {
  const { getToken, user } = useAppContext();

  const currency = import.meta.env.VITE_CURRENCY;
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const base_url = import.meta.env.VITE_BASE_URL

  const getAllShows = async () => {
    try {
      const { data } = await axios.get(
        `${base_url}/api/admin/all-shows`,
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      );
      setShows(data.shows);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (user) {
      getAllShows();
    }
  }, [user]);

  return !loading ? (
    <>
      <h1 className="admin-title">List Shows</h1>
      <div className="blur-circle1" />
      <div className="blur-circle2" />
      <div className="listshows-table-wrapper">
        <table className="listshows-table">
          <thead>
            <tr>
              <th className="listshows-header movie">Movie Name</th>
              <th className="listshows-header">Show Time</th>
              <th className="listshows-header">Total Booking</th>
              <th className="listshows-header">Earning</th>
            </tr>
          </thead>
          <tbody>
            {shows.map((show, index) => (
              <tr key={index} className="listshows-row">
                <td className="listshows-cell movie">{show.movie.title}</td>
                <td className="listshows-cell">
                  {dateFormat(show.showDateTime)}
                </td>
                <td className="listshows-cell">
                  {Object.keys(show.occupiedSeats).length}
                </td>
                <td className="listshows-cell">
                  {currency}{" "}
                  {Object.keys(show.occupiedSeats).length * show.showPrice}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  ) : (
    <div className="spinner-fullscreen">
      <Spinner />
    </div>
  );
}

export default ListShows;
