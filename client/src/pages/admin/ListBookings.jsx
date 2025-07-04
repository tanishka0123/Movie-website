import { useEffect, useState } from "react";
import { dummyBookingData } from "../TicketBook/DummyData";
import Spinner from "../../components/spinner/Spinner";
import { dateFormat } from "../../lib/dateFormat";
import "./style.scss";

function ListBookings() {
  const currency = import.meta.env.VITE_CURRENCY;
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBookingData = () => {
    setBookings(dummyBookingData);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchBookingData();
  }, []);

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
    <Spinner />
  );
}

export default ListBookings;
