import { useParams } from "react-router-dom";
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
import { useAppContext } from "../../../context/AppContext";
import axios from "axios";
import PosterFallback from "../../../assets/no-poster.png";
import VideosSection from "../../details/videosSection/VideoSection.jsx";
import Similar from "../../details/carousels/Similar.jsx";
import Recommendation from "../../details/carousels/Recommendation.jsx";

function BookMovie() {
  const TMDB_TOKEN = import.meta.env.VITE_APP_TMDB_TOKEN;
  const { movieId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [videoId, setVideoId] = useState(null);
  const [book, setBook] = useState(false);
  const [crew, setCrew] = useState(null);
  const [video, setVideo] = useState(null);
  const [cast, setCast] = useState(null);

  const { image_base_url } = useAppContext();

  const getCrew = async () => {
    const { data } = await axios.get(
      `https://api.themoviedb.org/3/movie/${movieId}/credits`,
      {
        headers: {
          Authorization: `Bearer ${TMDB_TOKEN}`,
        },
      }
    );
    setCrew(data.crew);
    setCast(data.cast);
  };
  const director = crew?.filter((f) => f.job === "Director");
  const writer = crew?.filter(
    (f) => f.job === "Screenplay" || f.job === "Story" || f.job === "Writer"
  );

  const getVideo = async () => {
    const { data } = await axios.get(
      `https://api.themoviedb.org/3/movie/${movieId}/videos`,
      {
        headers: {
          Authorization: `Bearer ${TMDB_TOKEN}`,
        },
      }
    );
    setVideo(data);
  };

  const getShows = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `http://localhost:3000/api/show/${movieId}`
      );
      if (data.success) {
        setData(data);
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getShows();
    getCrew();
    getVideo();
  }, [movieId]);

  return (
    <ContentWrapper>
      <div className="detailsBanner">
        {!loading ? (
          <>
            {!!data && (
              <React.Fragment>
                <div className="backdrop-img">
                  <Img src={image_base_url + data.movie.backdrop_path} />
                </div>
                <div className="opacity-layer"></div>

                <div className="content">
                  <div className="left">
                    {data.movie.poster_path ? (
                      <Img
                        className="posterImg"
                        src={image_base_url + data.movie.poster_path}
                      />
                    ) : (
                      <Img className="posterImg" src={PosterFallback} />
                    )}
                  </div>
                  <div className="right">
                    <div className="titleContainer">
                      <div className="title">
                        {`${data.movie.name || data.movie.title} (${dayjs(
                          data?.movie.release_date
                        ).format("YYYY")})`}
                      </div>

                      <button
                        onClick={() => {
                          setBook(true);
                        }}
                      >
                        Book Tickets
                      </button>
                    </div>
                    <div className="subtitle">{data.movie.tagline}</div>

                    <div className="genres">
                      {data.movie.genres?.map((g) => {
                        return (
                          <div key={g.id} className="genre">
                            {g.name}
                          </div>
                        );
                      })}
                    </div>

                    <div className="row">
                      <CircleRating
                        rating={data.movie.vote_average?.toFixed(1)}
                      />
                      <div
                        className="playbtn"
                        onClick={() => {
                          setShow(true);
                          setVideoId(video?.results?.[0].key);
                        }}
                      >
                        <PlayIcon />
                        <span className="text">Watch Trailer</span>
                      </div>
                    </div>

                    <div className="overview">
                      <div className="heading">Overview</div>
                      <div className="description">{data.movie.overview}</div>
                    </div>

                    <div className="info">
                      {data.movie.status && (
                        <div className="infoItem">
                          <span className="text bold">Status: </span>
                          <span className="text">{data.movie.status}</span>
                        </div>
                      )}
                      {data.release_date && (
                        <div className="infoItem">
                          <span className="text bold">Release Date: </span>
                          <span className="text">
                            {dayjs(data.movie.release_date).format(
                              "MMM D, YYYY"
                            )}
                          </span>
                        </div>
                      )}
                      {data.runtime && (
                        <div className="infoItem">
                          <span className="text bold">Runtime: </span>
                          <span className="text">
                            {timeFormat(data.movie.runtime)}
                          </span>
                        </div>
                      )}
                    </div>

                    {director?.length > 0 && (
                      <div className="info">
                        <span className="text bold">Director: </span>
                        <span className="text">
                          {director?.map((d, i) => (
                            <span key={i}>
                              {d.name}
                              {director.length - 1 !== i && ", "}
                            </span>
                          ))}
                        </span>
                      </div>
                    )}

                    {writer?.length > 0 && (
                      <div className="info">
                        <span className="text bold">Writer: </span>
                        <span className="text">
                          {writer?.map((d, i) => (
                            <span key={i}>
                              {d.name}
                              {writer.length - 1 !== i && ", "}
                            </span>
                          ))}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <DatePopUp
                  book={book}
                  setBook={setBook}
                  dateTime={data.dateTime}
                  id={movieId}
                />
                <VideoPopup
                  show={show}
                  setShow={setShow}
                  videoId={videoId}
                  setVideoId={setVideoId}
                />
              </React.Fragment>
            )}

            <div className="booking-castSection">
              <div className="booking-sectionHeading">Top Cast</div>
              <div className="booking-listItems">
                {cast?.map((item) => {
                  return (
                    <div key={item.id} className="booking-listItem">
                      <div className="booking-profileImg">
                        <img src={image_base_url + item.profile_path} />
                      </div>
                      <div className="booking-name">{item.name}</div>
                      <div className="character">{item.character}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <VideosSection data={video} loading={loading} />
            <Similar mediaType={"movie"} id={movieId} />
            <Recommendation mediaType={"movie"} id={movieId} />
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
    </ContentWrapper>
  );
}

export default BookMovie;
