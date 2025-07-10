import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import "./moviecard.scss";
import CircleRating from "../../../components/circleRating/CircleRating";
import Img from "../../../components/lazyLoadImage/Img";
import { useAppContext } from "../../../context/AppContext";

const MovieCard = ({ data, user, openSignIn }) => {
  const { image_base_url } = useAppContext();
  const navigate = useNavigate();
  const handleClick = () => {
    if (!user) {
      openSignIn();
      return;
    }
    navigate(`/book/${data._id}`);
  };
  return (
    <div className="movieCard" onClick={handleClick}>
      <div className="posterBlock">
        <Img className="posterImg" src={image_base_url + data.poster_path} />
        <CircleRating rating={data.vote_average.toFixed(1)} />
        <div className="genres">
          {data.genres.slice(0, 2).map((g) => {
            return (
              <div key={g.id} className="genre">
                {g.name}
              </div>
            );
          })}
        </div>
      </div>
      <div className="textBlock">
        <span className="title">{data.title}</span>
        <span className="date">
          {dayjs(data.release_date).format("MMM D, YYYY")}
        </span>
      </div>
    </div>
  );
};

export default MovieCard;
