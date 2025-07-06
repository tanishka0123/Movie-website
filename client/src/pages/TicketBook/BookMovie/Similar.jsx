import {
  BsFillArrowLeftCircleFill,
  BsFillArrowRightCircleFill,
} from "react-icons/bs";
import React, { useRef } from "react";
import "./sim.scss";
import ContentWrapper from "../../../components/contentWrapper/ContentWrapper";
import { dummyShowsData } from "../DummyData.js";
import CircleRating from "../../../components/circleRating/CircleRating.jsx";
import dayjs from "dayjs";

function Similar() {
  const carouselContainer = useRef();

  const navigation = (dir) => {
    const container = carouselContainer.current;

    const scrollAmount =
      dir === "left"
        ? container.scrollLeft - (container.offsetWidth + 20)
        : container.scrollLeft + (container.offsetWidth + 20);

    container.scrollTo({
      left: scrollAmount,
      behavior: "smooth",
    });
  };
  return (
    <div className="booking-carousel">
      <ContentWrapper>
        <div className="booking-carouselTitle">Similar Movies</div>
        <BsFillArrowLeftCircleFill
          className="booking-carouselLeftNav arrow"
          onClick={() => navigation("left")}
        />
        <BsFillArrowRightCircleFill
          className="booking-carouselRighttNav arrow"
          onClick={() => navigation("right")}
        />
        <div className="booking-carouselItems" ref={carouselContainer}>
          {dummyShowsData.map((item) => {
            return (
              <div
                key={item.id}
                className="booking-carouselItem"
                onClick={() => navigate(`/movie/${item.id}`)}
              >
                <div className="booking-posterBlock">
                  <img src={item.poster_path} />
                  <CircleRating rating={item.vote_average.toFixed(1)} />
                </div>
                <div className="booking-textBlock">
                  <span className="booking-title">{item.title}</span>
                  <span className="booking-date">
                    {dayjs(item.release_date || item.first_air_date).format(
                      "MMM D, YYYY"
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </ContentWrapper>
    </div>
  );
}

export default Similar;
