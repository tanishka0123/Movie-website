import { useEffect, useState } from "react";
import Spinner from "../../components/spinner/Spinner";
import { dateFormat } from "../../lib/dateFormat";
import "./style.scss";
import { useAppContext } from "../../context/AppContext";
import axios from "axios";

function ListBookings() {
  const { getToken, user } = useAppContext();
  const currency = import.meta.env.VITE_CURRENCY;
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBookingData = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:3000/api/admin/all-bookings",
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      );
      setBookings(data.bookings);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBookingData();
    }
  }, [user]);

  return !isLoading ? (
    <div className="listbookings-wrapper">
      <h1 className="admin-title">List Bookings</h1>
      <div className="blur-circle1" />
      <div className="blur-circle2" />
      <div className="listbookings-table-wrapper">
        <table className="listbookings-table">
          <thead>
            <tr>
              <th className="listbookings-header user">User Name</th>
              <th className="listbookings-header">Movie Name</th>
              <th className="listbookings-header">Show Time</th>
              <th className="listbookings-header">Seats</th>
              <th className="listbookings-header">Amount</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking, index) => (
              <tr key={index} className="listbookings-row">
                <td className="listbookings-cell user">{booking.user.name}</td>
                <td className="listbookings-cell">
                  {booking.show.movie.title}
                </td>
                <td className="listbookings-cell">
                  {dateFormat(booking.show.showDateTime)}
                </td>
                <td className="listbookings-cell">
                  {Object.values(booking.bookedSeats).join(", ")}
                </td>
                <td className="listbookings-cell">
                  {currency} {booking.amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  ) : (
    <div className="spinner-fullscreen">
      <Spinner />
    </div>
  );
}

export default ListBookings;
