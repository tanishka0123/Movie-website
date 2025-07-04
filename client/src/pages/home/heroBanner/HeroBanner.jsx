import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import "./style.scss";
import { BiSolidCameraMovie } from "react-icons/bi";
import useFetch from "../../../hooks/useFetch";

import Img from "../../../components/lazyLoadImage/Img";
import ContentWrapper from "../../../components/contentWrapper/ContentWrapper";

const HeroBanner = () => {
  const [background, setBackground] = useState("");
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { url } = useSelector((state) => state.home);
  const { data, loading } = useFetch("/movie/upcoming");

  useEffect(() => {
    if (!data?.results?.length || !url?.backdrop) return;

    const randomIndex = Math.floor(Math.random() * data.results.length);
    const backdropPath = data.results[randomIndex]?.backdrop_path;

    if (backdropPath) {
      const fullUrl = `${url.backdrop}${backdropPath}`;
      setBackground(fullUrl);
    } else {
      setBackground("/img.png");
    }
  }, [data, url]);

  const searchQueryHandler = (event) => {
    if (event.key === "Enter" && query.length > 0) {
      navigate(`/search/${query}`);
    }
  };

  return (
    <div className="heroBanner">
      {!loading && (
        <div className="backdrop-img">
          <Img src={background} />
        </div>
      )}

      <div className="opacity-layer"></div>
      <ContentWrapper>
        <div className="heroBannerContent">
          <span className="title">Welcome.</span>
          <span className="subTitle">
            Millions of movies, TV shows and people to discover. Explore now.
          </span>
          <div className="searchInput">
            <input
              type="text"
              placeholder="Search for a movie or tv show...."
              onChange={(e) => setQuery(e.target.value)}
              onKeyUp={searchQueryHandler}
            />
            <button>Search</button>
          </div>
          <button onClick={()=> navigate("/book")} className="btn">
            Book Tickets <BiSolidCameraMovie size={"25px"} className="icon" />
          </button>
        </div>
      </ContentWrapper>
    </div>
  );
};

export default HeroBanner;
