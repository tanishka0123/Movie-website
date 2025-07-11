import { useEffect, useState } from "react";
import "./BookMovie.scss";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { RxCross2 } from "react-icons/rx";
import Select from "react-select";
import { useRef } from "react";

const DatePopUp = ({ book, setBook, id, dateTime }) => {
  const nav = useNavigate();
  const scrollRef = useRef(null);
  const [selectedDate, setSelectedDate] = useState();

  const handleBook = () => {
    if (!selectedDate) {
      return toast.error("Please select a time slot to book.");
    }
    nav(`/book/${id}/${selectedDate}`);
    setBook(false);
  };

  const scrollLeft = () => {
    scrollRef.current.scrollBy({ left: -200, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollRef.current.scrollBy({ left: 200, behavior: "smooth" });
  };

  const hidePopup = () => setBook(false);

  const options = Object.keys(dateTime).map((date) => {
    const d = new Date(date);
    const label = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      weekday: "short",
    });
    return {
      value: date,
      label,
    };
  });

  const [showArrows, setShowArrows] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      setShowArrows(el.scrollWidth > el.clientWidth);
    }
  }, [dateTime]);

  return (
    <div className={`datePopup ${book ? "visible" : ""}`}>
      <div className="opacityLayer" onClick={hidePopup}></div>
      <div className="datePicker">
        <span className="closeBtn" onClick={hidePopup}>
          <RxCross2 />
        </span>

        {window.innerWidth > 768 ? (
          <div className="chooseDateContainer">
            <div className="DateContent">
              {showArrows && (
                <IoIosArrowBack className="arrowBtn" onClick={scrollLeft} />
              )}
              <div className="dateScroller" ref={scrollRef}>
                {Object.keys(dateTime).map((date) => {
                  const d = new Date(date);
                  return (
                    <div
                      key={date}
                      className={`dateBox ${
                        selectedDate === date ? "active" : ""
                      }`}
                      onClick={() => setSelectedDate(date)}
                    >
                      <div>
                        {d.toLocaleDateString("en-US", { month: "short" })}
                      </div>
                      <div>{d.getDate()}</div>
                    </div>
                  );
                })}
              </div>
              {showArrows && (
                <IoIosArrowForward className="arrowBtn" onClick={scrollRight} />
              )}
            </div>

            <div className="bookNowWrapper">
              <button onClick={handleBook} className="bookNowBtn">
                Book Now
              </button>
            </div>
          </div>
        ) : (
          <div className="dateDropdownWrapper">
            <div className="dropdownTitle">Select Show Date</div>
            <Select
              className="reactSelect"
              classNamePrefix="rs"
              options={options}
              placeholder="Choose a date..."
              onChange={(selected) => setSelectedDate(selected?.value)}
              value={options.find((opt) => opt.value === selectedDate) || null}
              styles={{
                control: (base, state) => ({
                  ...base,
                  borderRadius: "15px",
                  height: "55px",
                  fontSize: "16px",
                  fontWeight: "500",
                  border: "none",
                  paddingLeft: "10px",
                  backgroundColor: "white",
                  color: "#333",
                  cursor: "pointer",
                  boxShadow: state.isFocused
                    ? "0 0 0 2px rgba(255,255,255,0.3)"
                    : "0 4px 15px rgba(0,0,0,0.1)",
                }),
                dropdownIndicator: (base) => ({
                  ...base,
                  color: "#888",
                  paddingRight: "10px",
                }),
                option: (base, state) => ({
                  ...base,
                  padding: "12px 20px",
                  backgroundColor: state.isSelected
                    ? "#ffe0ec"
                    : state.isFocused
                    ? "#f8f9fa"
                    : "white",
                  color: "#333",
                  fontWeight: state.isSelected ? "bold" : "normal",
                }),
                menu: (base) => ({
                  ...base,
                  borderRadius: "12px",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
                  overflow: "auto",
                  maxHeight: "200px",
                  zIndex: 9999,
                }),
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              }}
              menuPortalTarget={document.body}
            />

            <div className="buttonGroup">
              <button onClick={hidePopup} className="cancelBtn">
                Cancel
              </button>
              <button onClick={handleBook} className="bookNowBtn">
                Book Now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DatePopUp;
