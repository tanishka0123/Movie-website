import { useEffect, useState } from "react";
import Spinner from "../../../components/spinner/Spinner";
import timeFormat from "../../../lib/timeFormat";
import { dateFormat } from "../../../lib/dateFormat";
import "./style.scss";
import { useAppContext } from "../../../context/AppContext";
import axios from "axios";
import { Link } from "react-router-dom";

function MyBookings() {
  const currency = import.meta.env.VITE_CURRENCY;
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getToken, user, image_base_url } = useAppContext();
  const base_url = import.meta.env.VITE_BASE_URL

  const getMyBookings = async () => {
    try {
      const { data } = await axios.get(
        `${base_url}/api/user/bookings`,
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      );
      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (error) {
      console.log(error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      getMyBookings();
    }
  }, [user]);

  return !loading ? (
    <div className="mybookings-container">
      <div className="booking-blur1" />
      <div className="booking-blur2" />

      <h1 className="booking-heading">My Bookings</h1>

      {bookings.length > 0 ? (
        bookings.map((item, index) => (
          <div className="booking-card" key={index}>
            <div className="booking-info">
              <img
                src={image_base_url + item.show.movie.poster_path}
                alt=""
                className="booking-poster"
              />
              <div className="booking-details">
                <p className="movie-title">{item.show.movie.title}</p>
                <p className="movie-runtime">
                  {timeFormat(item.show.movie.runtime)}
                </p>
                <p className="movie-date">
                  {dateFormat(item.show.showDateTime)}
                </p>
              </div>
            </div>
            <div className="booking-summary">
              <div className="payment-details">
                <p className="booking-amount">
                  {currency}
                  {item.amount}
                </p>
              </div>
              <div className="ticket-info">
                <p>
                  <span>Total Tickets:</span> {item.bookedSeats.length}
                </p>
                <p>
                  <span>Seat Number:</span> {item.bookedSeats.join(", ")}
                </p>
                {!item.isPaid && (
                  <Link to={item.paymentLink} className="pay-now-btn">
                    Pay Now
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="nobooking">No Bookings Yet Made </div>
      )}
    </div>
  ) : (
    <Spinner initial={true} />
  );
}

export default MyBookings;
