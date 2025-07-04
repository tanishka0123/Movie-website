import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { dummyDateTimeData, dummyShowsData } from "../DummyData";
import "./style.scss";
import { FaClockRotateLeft } from "react-icons/fa6";

import toast from "react-hot-toast";
import { FaArrowRight } from "react-icons/fa";
import isoTimeFormat from "../../../lib/IsoTime";

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

  const nav = useNavigate();

  const getShow = async () => {
    const show = dummyShowsData.find((show) => show._id === id);
    if (show) {
      setShow(show);
    }
  };

  const handleSeatClick = (seatId) => {
    if (!selectedTime) {
      return toast.error("Please select a time slot to book.");
    }
    if (!selectedSeat.includes(seatId) && selectedSeat.length > 4) {
      return toast.error("You can only select upto 5 seats");
    }
    setSelectedSeat((prev) =>
      prev.includes(seatId)
        ? prev.filter((seat) => seat != seatId)
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
                selectedSeat.includes(seatId) && "primary"
              } `}
            >
              {seatId}
            </button>
          );
        })}
      </div>
    </div>
  );
  useEffect(() => {
    getShow();
  }, []);

  return (
    <div className="topContainer">
      <div className="blur-circle1" />

      <div className="container">
        <div className="timings">
          <p className="heading">Available Timings</p>
          <div className="timeSlots">
            {dummyDateTimeData[date].map((item) => (
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
          <img src="/screenImage.svg" alt="screen" />
          <p className="small-text">SCREEN SIDE</p>
          <div className="seatarea">
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
          <button className="btn" onClick={() => nav("/my-bookings")}>
            Proceed to Checkout <FaArrowRight className="icon" />
          </button>
        </div>
      </div>
      <div className="blur-circle2"/>
    </div>
  );
}

export default SeatBook;
