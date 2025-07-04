import React, { useEffect, useState } from "react";
import { dummyShowsData } from "../TicketBook/DummyData";
import Spinner from "../../components/spinner/Spinner";
import { FaStar } from "react-icons/fa";
import { FaCheckSquare } from "react-icons/fa";
import { RiDeleteBack2Fill } from "react-icons/ri";
import { kConverter } from "../../lib/kConverter";
import "./style.scss";

function Addshows() {
  const currency = import.meta.env.VITE_CURRENCY;
  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [dateTimeSelection, setDateTimeSelection] = useState({});
  const [dateTimeInput, setDateTimeInput] = useState("");
  const [showPrice, setShowPrice] = useState("");

  const fetchNowPlayingMovies = async () => {
    setNowPlayingMovies(dummyShowsData);
  };

  const handleDateTimeAdd = () => {
    if (!dateTimeInput) return;
    const [date, time] = dateTimeInput.split("T");
    if (!date || !time) return;
    setDateTimeSelection((prev) => {
      const times = prev[date] ?? [];
      if (times.includes(time)) {
        return prev;
      }
      const next = { ...prev, [date]: [...times, time] };
      return next;
    });
  };

  const handleRemoveDateTime = (date, time) => {
    setDateTimeSelection((prev) => {
      const filteredTimes = prev[date].filter((t) => t !== time);
      if (filteredTimes.length === 0) {
        const { [date]: _, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [date]: filteredTimes,
      };
    });
  };

  useEffect(() => {
    fetchNowPlayingMovies();
  }, []);

  return nowPlayingMovies.length > 0 ? (
    <>
      <h1 className="admin-title">Add Shows</h1>
      <div className="blur-circle1" />
      <div className="blur-circle2" />
      <p className="show-subtitle">Scroll Through What's Playing and Make Your Selection...</p>
      <div className="addshows-container">
        <div className="addshows-movie-selection-wrapper">
          <div className="addshows-movie-list">
            {nowPlayingMovies.map((movie) => (
              <div
                onClick={() => setSelectedMovie(movie.id)}
                key={movie._id}
                className={`addshows-movie-card ${
                  selectedMovie === movie.id ? "selected" : ""
                }`}
              >
                <div className="addshows-poster-wrapper">
                  <img src={movie.poster_path} alt="" />
                  <div className="addshows-rating-bar">
                    <p className="addshows-rating">
                      <FaStar className="icon-star" />
                      {movie.vote_average.toFixed(1)}
                    </p>
                    <p className="addshows-vote-count">
                      {kConverter(movie.vote_count)} votes
                    </p>
                  </div>
                </div>

                {selectedMovie === movie.id && (
                  <div className="addshows-selected-check">
                    <FaCheckSquare className="check-icon" strokeWidth={2.5} />
                  </div>
                )}

                <p className="addshows-movie-title">{movie.title}</p>
                <p className="addshows-release-date">{movie.release_date}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="addshows-price-section">
          <label className="addshows-label">Show Price</label>
          <div className="addshows-price-input-wrapper">
            <p className="currency">{currency}</p>
            <input
              type="number"
              min={0}
              value={showPrice}
              onChange={(e) => setShowPrice(e.target.value)}
              placeholder="Enter show price"
            />
          </div>
        </div>

        <div className="addshows-datetime-section">
          <label className="addshows-label">Select Date and time</label>
          <div className="addshows-datetime-input-wrapper">
            <input
              type="datetime-local"
              value={dateTimeInput}
              onChange={(e) => setDateTimeInput(e.target.value)}
            />
            <button onClick={handleDateTimeAdd} className="addshows-add-btn">
              Add Time
            </button>
          </div>
        </div>

        {Object.keys(dateTimeSelection).length > 0 && (
          <div className="addshows-selected-dates">
            <h2>Selected Date-Time</h2>
            <ul>
              {Object.entries(dateTimeSelection).map(([date, times]) => (
                <li key={date}>
                  <div className="addshows-date-label">{date}</div>
                  <div className="addshows-time-badges">
                    {times.map((time) => (
                      <div key={time} className="addshows-time-badge">
                        <span>{time}</span>
                        <RiDeleteBack2Fill
                          onClick={() => handleRemoveDateTime(date, time)}
                          className="delete-icon"
                          width={15}
                        />
                      </div>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
            <button className="addshows-submit-btn">Add Show</button>
          </div>
        )}
      </div>
    </>
  ) : (
    <Spinner />
  );
}

export default Addshows;
