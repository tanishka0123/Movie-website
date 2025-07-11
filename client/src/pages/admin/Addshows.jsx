import React, { useEffect, useState } from "react";
import Spinner from "../../components/spinner/Spinner";
import { FaStar } from "react-icons/fa";
import { FaCheckSquare } from "react-icons/fa";
import { RiDeleteBack2Fill } from "react-icons/ri";
import { kConverter } from "../../lib/kConverter";
import "./style.scss";
import { useAppContext } from "../../context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";

function Addshows() {
  const { getToken, user, image_base_url } = useAppContext();

  const currency = import.meta.env.VITE_CURRENCY;
  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [dateTimeSelection, setDateTimeSelection] = useState({});
  const [dateTimeInput, setDateTimeInput] = useState("");
  const [showPrice, setShowPrice] = useState("");
  const [addingShow, setAddingShow] = useState(false);
  const base_url = import.meta.env.VITE_BASE_URL

  const fetchNowPlayingMovies = async () => {
    try {
      const { data } = await axios.get(
        `${base_url}/api/show/now-playing`,
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      );
      if (data.success) {
        setNowPlayingMovies(data.movies);
      }
    } catch (error) {
      console.log("error fetching movies", error);
    }
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

  const handleSubmit = async () => {
    try {
      setAddingShow(true);
      if (
        !selectedMovie ||
        Object.keys(dateTimeSelection).length == 0 ||
        !showPrice
      ) {
        return toast("Missing required fields");
      }
      const showsInput = Object.entries(dateTimeSelection).map(
        ([date, time]) => ({ date, time })
      );

      const payload = {
        movieId: selectedMovie,
        showsInput,
        showPrice: Number(showPrice),
      };

      const { data } = await axios.post(
        `${base_url}/api/show/add`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      );

      if (data.success) {
        toast.success(data.message);
        setSelectedMovie(null);
        setDateTimeSelection({});
        setShowPrice("");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("An error occured. Please try again");
    }
    setAddingShow(false);
  };

  useEffect(() => {
    if (user) {
      fetchNowPlayingMovies();
    }
  }, [user]);

  return nowPlayingMovies.length > 0 ? (
    <>
      <h1 className="admin-title">Add Shows</h1>
      <div className="blur-circle1" />
      <div className="blur-circle2" />
      <p className="show-subtitle">
        Scroll Through What's Playing and Make Your Selection...
      </p>
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
                  <img src={image_base_url + movie.poster_path} alt="" />
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
            <button
              onClick={handleSubmit}
              disabled={addingShow}
              className="addshows-submit-btn"
            >
              Add Show
            </button>
          </div>
        )}
      </div>
    </>
  ) : (
    <div className="spinner-fullscreen">
      <Spinner />
    </div>
  );
}

export default Addshows;
