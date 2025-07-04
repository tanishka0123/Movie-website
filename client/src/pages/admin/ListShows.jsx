import React, { useEffect, useState } from "react";
import { dummyShowsData } from "../TicketBook/DummyData";
import Spinner from "../../components/spinner/Spinner";
import { dateFormat } from "../../lib/dateFormat";
import "./style.scss";

function ListShows() {
  const currency = import.meta.env.VITE_CURRENCY;
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);

  const getAllShows = async () => {
    try {
      setShows([
        {
          movie: dummyShowsData[0],
          showDateTime: "2025-06-30T02:30:00.000Z",
          showPrice: 59,
          occupiedSeats: {
            A1: "user_1",
            B1: "user_2",
            C1: "user_3",
          },
        },
      ]);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllShows();
  }, []);

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
    <Spinner />
  );
}

export default ListShows;
