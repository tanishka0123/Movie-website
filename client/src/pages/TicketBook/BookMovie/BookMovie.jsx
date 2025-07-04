import { useNavigate, useParams } from "react-router-dom";
import { dummyShowsData } from "../DummyData.js";
import "./BookMovie.scss";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import ContentWrapper from "../../../components/contentWrapper/ContentWrapper.jsx";
import CircleRating from "../../../components/circleRating/CircleRating.jsx";
import Img from "../../../components/lazyLoadImage/Img.jsx";
import { PlayIcon } from "../../details/PlayButton.jsx";
import VideoPopup from "../../../components/videoPopup/VideoPopup.jsx";
import DatePopUp from "./DatePopUp.jsx";
import timeFormat from "../../../lib/timeFormat.js";

function BookMovie() {
  const { movieId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [videoId, setVideoId] = useState(null);
  const [book, setBook] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    setLoading(true);
    const found = dummyShowsData.find((item) => item.id === movieId);
    if (found=== undefined) {
      setLoading(false);
      nav("/404");
    } 
      setData(found);
      setLoading(false);
    
  }, [movieId]);


  return (
    <div className="detailsBanner">
      {!loading ? (
        <>
          {!!data && (
            <React.Fragment>
              <div className="backdrop-img">
                <Img src={data.backdrop_path} />
              </div>
              <div className="opacity-layer"></div>
              <ContentWrapper>
                <div className="content">
                  <div className="left">
                    <Img className="posterImg" src={data.poster_path} />
                  </div>
                  <div className="right">
                    <div className="titleContainer">
                      <div className="title">
                        {`${data.title} (${dayjs(data?.release_date).format(
                          "YYYY"
                        )})`}
                      </div>

                      <button
                        onClick={() => {
                          setBook(true);
                        }}
                      >
                        Book Tickets
                      </button>
                    </div>
                    <div className="subtitle">{data.tagline}</div>

                    <div className="genres">
                      {data.genres.slice(0, 2).map((g) => {
                        return (
                          <div key={g.id} className="genre">
                            {g.name}
                          </div>
                        );
                      })}
                    </div>

                    <div className="row">
                      <CircleRating rating={data.vote_average.toFixed(1)} />
                      <div
                        className="playbtn"
                        onClick={() => {
                          setShow(true);
                          setVideoId(data.trailer_url);
                        }}
                      >
                        <PlayIcon />
                        <span className="text">Watch Trailer</span>
                      </div>
                    </div>

                    <div className="overview">
                      <div className="heading">Overview</div>
                      <div className="description">{data.overview}</div>
                    </div>

                    <div className="info">
                      {data.status && (
                        <div className="infoItem">
                          <span className="text bold">Status: </span>
                          <span className="text">{data.status}</span>
                        </div>
                      )}
                      {data.release_date && (
                        <div className="infoItem">
                          <span className="text bold">Release Date: </span>
                          <span className="text">
                            {dayjs(data.release_date).format("MMM D, YYYY")}
                          </span>
                        </div>
                      )}
                      {data.runtime && (
                        <div className="infoItem">
                          <span className="text bold">Runtime: </span>
                          <span className="text">
                            {timeFormat(data.runtime)}
                          </span>
                        </div>
                      )}
                    </div>

                    {data.director && (
                      <div className="info">
                        <span className="text bold">Director: </span>
                        <span className="text">{data.director}</span>
                      </div>
                    )}

                    {data.writer && (
                      <div className="info">
                        <span className="text bold">Writer: </span>
                        <span className="text">{data.writer}</span>
                      </div>
                    )}
                  </div>
                </div>
                <DatePopUp book={book} setBook={setBook} id={movieId} />
                <VideoPopup
                  show={show}
                  setShow={setShow}
                  videoId={videoId}
                  setVideoId={setVideoId}
                />
              </ContentWrapper>
            </React.Fragment>
          )}
        </>
      ) : (
        <div className="detailsBannerSkeleton">
          <ContentWrapper>
            <div className="left skeleton"></div>
            <div className="right">
              <div className="row skeleton"></div>
              <div className="row skeleton"></div>
              <div className="row skeleton"></div>
              <div className="row skeleton"></div>
              <div className="row skeleton"></div>
              <div className="row skeleton"></div>
              <div className="row skeleton"></div>
            </div>
          </ContentWrapper>
        </div>
      )}
    </div>
  );
}

export default BookMovie;
