import ContentWrapper from "../../../components/contentWrapper/ContentWrapper";
import "./style.scss";
import MovieCard from "../MovieCard/MovieCard";
import { useClerk, useUser } from "@clerk/clerk-react";
import { useAppContext } from "../../../context/AppContext";

function TicketBook() {
  const { user } = useUser();
  const { openSignIn } = useClerk();

  const { shows } = useAppContext();
  return (
    <div className="TicketPage">
      <ContentWrapper>
        <div className="pageHeader">
          <div className="pageTitle">Explore Currently Playing Movies</div>
        </div>
        <div className="content">
          {shows.map((item, index) => {
            return (
              <MovieCard
                key={index}
                data={item}
                user={user}
                openSignIn={openSignIn}
              />
            );
          })}
        </div>
      </ContentWrapper>
    </div>
  );
}

export default TicketBook;
