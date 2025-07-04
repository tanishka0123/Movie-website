import ContentWrapper from "../../../components/contentWrapper/ContentWrapper";
import "./style.scss";
import { dummyShowsData } from "../DummyData";
import MovieCard from "../MovieCard/MovieCard";
import { useClerk, useUser } from "@clerk/clerk-react";

function TicketBook() {

    const { user } = useUser();
  const { openSignIn } = useClerk();
  return (
    <div className="TicketPage">
      <ContentWrapper>
        <div className="pageHeader">
          <div className="pageTitle">Explore Movies</div>
        </div>
        <div className="content">
          {dummyShowsData.map((item, index) => {
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
