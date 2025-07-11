import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./style.scss";
import { FaClockRotateLeft } from "react-icons/fa6";
import toast from "react-hot-toast";
import { FaArrowRight } from "react-icons/fa";
import isoTimeFormat from "../../../lib/IsoTime";
import { useAppContext } from "../../../context/AppContext";
import axios from "axios";

function SeatBook() {
  const groupRows = [
    ["A", "B"],
    ["C", "D"],
    ["E", "F"],
    ["G", "H"],
    ["I", "J"],
  ];
  const { id, date } = useParams();
  const [selectedSeat, setSelectedSeat] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [show, setShow] = useState(null);
  const [occupiedSeats, setOccupiedSeats] = useState([]);

  const nav = useNavigate();
  const { getToken, user } = useAppContext();
  const seatAreaRef = useRef(null);

  const getShow = async () => {
    try {
      const { data } = await axios.get(`http://localhost:3000/api/show/${id}`);
      if (data.success) {
        setShow(data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSeatClick = (seatId) => {
    if (!selectedTime) {
      return toast.error("Please select a time slot to book.");
    }
    if (!selectedSeat.includes(seatId) && selectedSeat.length > 4) {
      return toast.error("You can only select up to 5 seats");
    }
    if (occupiedSeats.includes(seatId)) {
      return toast.error("This seat is already booked");
    }

    setSelectedSeat((prev) =>
      prev.includes(seatId)
        ? prev.filter((seat) => seat !== seatId)
        : [...prev, seatId]
    );
  };

  const renderSeats = (row, count = 9) => (
    <div key={row} className="seatcontainer">
      <div className="seatrow">
        {Array.from({ length: count }, (_, i) => {
          const seatId = `${row}${i + 1}`;
          return (
            <button
              key={seatId}
              onClick={() => handleSeatClick(seatId)}
              className={`singleSeat ${
                selectedSeat.includes(seatId) ? "primary" : ""
              } ${occupiedSeats.includes(seatId) ? "occupied" : ""}`}
            >
              {seatId}
            </button>
          );
        })}
      </div>
    </div>
  );

  const getOccupiedSeats = async () => {
    try {
      const { data } = await axios.get(
        `http://localhost:3000/api/booking/seats/${selectedTime.showId}`
      );
      if (data.success) {
        setOccupiedSeats(data.occupiedSeats);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const bookTickets = async () => {
    try {
      if (!user) return toast.error("Please login to proceed");
      if (!selectedTime || !selectedSeat.length) {
        return toast.error("Please select time and seats");
      }

      const token = await getToken();

      const { data } = await axios.post(
        `http://localhost:3000/api/booking/create`,
        { showId: selectedTime.showId, selectedSeats: selectedSeat },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (data.success) {
        toast.loading("Redirecting to payment...", { duration: 2000 });
        window.location.href = data.url;
      } else {
        toast.error(data.message || "Booking failed");
      }
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  };

  useEffect(() => {
    getShow();
  }, []);

  useEffect(() => {
    if (selectedTime) {
      getOccupiedSeats();
    }
  }, [selectedTime]);

  // Scroll to center of seat area
  useEffect(() => {
    if (seatAreaRef.current) {
      const container = seatAreaRef.current;
      container.scrollLeft = (container.scrollWidth - container.clientWidth) / 2;
    }
  }, []);

  return (
    <div className="topContainer">
      <div className="blur-circle1" />
      <div className="container">
        <div className="timings">
          <p className="heading">Available Timings</p>
          <div className="timeSlots">
            {show?.dateTime[date].map((item) => (
              <div
                key={item.time}
                onClick={() => setSelectedTime(item)}
                className={`timeSlot ${
                  selectedTime?.time === item.time ? "selected" : ""
                }`}
              >
                <FaClockRotateLeft className="icon" />
                <p>{isoTimeFormat(item.time)}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="seats">
          <h1 className="title">Select Your Seats</h1>
          <div className="seatarea" ref={seatAreaRef}>
            <div className="seat-scroll-wrapper">
              <img src="/screenImage.svg" alt="screen" className="screen-image" />
              <div className="frontrows">
                {groupRows[0].map((row) => renderSeats(row))}
              </div>
              <div className="nextrows">
                {groupRows.slice(1).map((group, idx) => (
                  <div className="rows" key={idx}>
                    {group.map((row) => renderSeats(row))}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <button className="btn" onClick={bookTickets}>
            Proceed to Checkout <FaArrowRight className="icon" />
          </button>
        </div>
      </div>
      <div className="blur-circle2" />
    </div>
  );
}

export default SeatBook;
