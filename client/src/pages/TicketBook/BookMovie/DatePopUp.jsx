import { useState } from "react";
import { dummyDateTimeData } from "../DummyData";
import "./BookMovie.scss";
import { IoIosArrowBack } from "react-icons/io";
import { IoIosArrowForward } from "react-icons/io";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { RxCross2 } from "react-icons/rx";

const DatePopUp = ({ book, setBook, id, dateTime }) => {
  const nav = useNavigate();
  const data = dummyDateTimeData;
  const dateKeys = Object.keys(data); // ["2025-07-24", "2025-07-25", ...]

  const [selectedDate, setSelectedDate] = useState();

  const handleBook = () => {
    if (!selectedDate) {
      return toast.error("Please select a time slot to book.");
    }
    nav(`/book/${id}/${selectedDate}`);
    setBook(false);
  };

  const hidePopup = () => {
    setBook(false);
  };

  return (
    <div className={`datePopup ${book ? "visible" : ""}`}>
      <div className="opacityLayer" onClick={hidePopup}></div>
      <div className="datePicker">
        <span className="closeBtn" onClick={hidePopup}>
          <RxCross2 />
        </span>

        <div className="chooseDateContainer">
          <div className="DateContent">
            <div className="dateScroller">
              <IoIosArrowBack />
              {Object.keys(dateTime).map((date) => {
                const day = new Date(date);
                const dayName = day.toLocaleDateString("en-US", {month: "short"}); // Tue, Wed
                const dateNum = day.getDate(); // 15, 16

                return (
                  <div
                    key={date}
                    className={`dateBox ${
                      selectedDate === date ? "active" : ""
                    }`}
                    onClick={() => setSelectedDate(date)}
                  >
                    <div>{dayName}</div>
                    <div>{dateNum}</div>
                  </div>
                );
              })}
              <IoIosArrowForward />
            </div>
          </div>

          <div className="bookNowWrapper">
            <button onClick={handleBook} className="bookNowBtn">
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatePopUp;
