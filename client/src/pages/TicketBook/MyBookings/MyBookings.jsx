import { useEffect, useState } from "react";
import { dummyBookingData } from "../DummyData";
import Spinner from "../../../components/spinner/Spinner";
import timeFormat from "../../../lib/timeFormat";
import { dateFormat } from "../../../lib/dateFormat";
import "./style.scss";
import { useAppContext } from "../../../context/AppContext";
import axios from "axios";

function MyBookings() {
  const currency = import.meta.env.VITE_CURRENCY;
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getToken, user, image_base_url } = useAppContext();

  const getMyBookings = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:3000/api/user/bookings",
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

      {bookings?.map((item, index) => (
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
              <p className="movie-date">{dateFormat(item.show.showDateTime)}</p>
            </div>
          </div>
          <div className="booking-summary">
            <div className="payment-details">
              <p className="booking-amount">
                {currency}
                {item.amount}
              </p>
              {!item.isPaid && <button className="pay-now-btn">Pay Now</button>}
            </div>
            <div className="ticket-info">
              <p>
                <span>Total Tickets:</span> {item.bookedSeats.length}
              </p>
              <p>
                <span>Seat Number:</span> {item.bookedSeats.join(", ")}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <Spinner initial={true} />
  );
}

export default MyBookings;
