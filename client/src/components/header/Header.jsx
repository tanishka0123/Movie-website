import React, { useState, useEffect } from "react";
import { HiOutlineSearch } from "react-icons/hi";
import { SlMenu } from "react-icons/sl";
import { VscChromeClose } from "react-icons/vsc";
import { useNavigate, useLocation } from "react-router-dom";
import { useClerk, UserButton, useUser } from "@clerk/clerk-react";
import "./header.scss";
import { IoTicketSharp } from "react-icons/io5";
import ContentWrapper from "../contentWrapper/ContentWrapper";
import logo from "../../assets/movix-logo.svg";
import { useAppContext } from "../../context/AppContext";

const Header = () => {
  const [show, setShow] = useState("top");
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [query, setQuery] = useState("");
  const [showSearch, setShowSearch] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const { isAdmin } = useAppContext();
  const { user } = useUser();
  const { openSignIn } = useClerk();

  useEffect(() => {
    window.scrollTo(0, 0);
    setMobileMenu(false);
    setShowSearch(false);
  }, [location]);

  const controlNavbar = () => {
    if (window.scrollY > 200) {
      if (window.scrollY > lastScrollY && !mobileMenu) {
        setShow("hide");
      } else {
        setShow("show");
      }
    } else {
      setShow("top");
    }
    setLastScrollY(window.scrollY);
  };

  useEffect(() => {
    window.addEventListener("scroll", controlNavbar);
    return () => {
      window.removeEventListener("scroll", controlNavbar);
    };
  }, [lastScrollY]);

  const searchQueryHandler = (event) => {
    if (event.key === "Enter" && query.length > 0) {
      navigate(`/search/${query}`);
      setTimeout(() => {
        setShowSearch(false);
      }, 1000);
    }
  };

  const openSearch = () => {
    setMobileMenu(false);
    setShowSearch(true);
  };

  const openMobileMenu = () => {
    setMobileMenu(true);
    setShowSearch(false);
  };

  const navigationHandler = (type) => {
    if (type === "movie") {
      navigate("/explore/movie");
    } else if (type === "book") {
      navigate("/book");
    } else {
      navigate("/explore/tv");
    }
    setMobileMenu(false);
    setShowSearch(false);
  };

  return (
    <header className={`header ${mobileMenu ? "mobileView" : ""} ${show}`}>
      <ContentWrapper>
        <div className="logo" onClick={() => navigate("/")}>
          <img src={logo} alt="logo" />
        </div>

        <div className="centerMenu">
          <ul className="menuItems centerItems">
            <li className="menuItem" onClick={() => navigationHandler("book")}>
              Book Tickets
            </li>
            <li className="menuItem" onClick={() => navigationHandler("movie")}>
              Movies
            </li>
            <li className="menuItem" onClick={() => navigationHandler("tv")}>
              TV Shows
            </li>
            {isAdmin && (
              <li className="menuItem" onClick={() => navigate("/admin")}>
                Dashboard
              </li>
            )}
          </ul>
        </div>

        <div className="rightMenu">
          <ul className="menuItems rightItems">
            <li className="menuItem">
              <HiOutlineSearch onClick={openSearch} />
            </li>
            <li className="menuItem">
              {!user ? (
                <p onClick={openSignIn}>Login</p>
              ) : (
                <UserButton>
                  <UserButton.MenuItems>
                    <UserButton.Action
                      label="My Bookings"
                      labelIcon={<IoTicketSharp />}
                      onClick={() => navigate("/my-bookings")}
                    />
                  </UserButton.MenuItems>
                </UserButton>
              )}
            </li>
          </ul>
        </div>

        <div className="mobileMenuItems">
          {mobileMenu ? (
            <VscChromeClose onClick={() => setMobileMenu(false)} />
          ) : (
            <SlMenu onClick={openMobileMenu} />
          )}
          {!user ? (
            <p className="menuItem" onClick={openSignIn}>
              Login
            </p>
          ) : (
            <UserButton />
          )}
        </div>
      </ContentWrapper>

      {mobileMenu && (
        <ul className="menuItems mobileMenuList">
          <li className="menuItem" onClick={() => navigationHandler("book")}>
            Book Tickets
          </li>
          <li className="menuItem" onClick={() => navigationHandler("movie")}>
            Movies
          </li>
          <li className="menuItem" onClick={() => navigationHandler("tv")}>
            TV Shows
          </li>
          {user && (
            <li className="menuItem" onClick={() => navigate("/my-bookings")}>
              My bookings
            </li>
          )}
          {isAdmin && (
            <li className="menuItem" onClick={() => navigate("/admin")}>
              Dashboard
            </li>
          )}
        </ul>
      )}

      {showSearch && (
        <div className="searchBar">
          <ContentWrapper>
            <div className="searchInput">
              <input
                type="text"
                placeholder="Search for a movie or tv show...."
                onChange={(e) => setQuery(e.target.value)}
                onKeyUp={searchQueryHandler}
              />
              <VscChromeClose onClick={() => setShowSearch(false)} />
            </div>
          </ContentWrapper>
        </div>
      )}
    </header>
  );
};

export default Header;
