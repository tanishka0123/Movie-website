import { useLocation, useNavigate } from "react-router-dom";
import ContentWrapper from "../contentWrapper/ContentWrapper";
import "./adminNavbar.scss";
import { useEffect, useState } from "react";
import logo from "../../assets/movix-logo.svg";

function AdminNavbar() {
  const navigate = useNavigate();
  const [show, setShow] = useState("top");
  const [lastScrollY, setLastScrollY] = useState(0);
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  const controlNavbar = () => {
    if (window.scrollY > 200) {
      if (window.scrollY > lastScrollY) {
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
  return (
    <header className={`header ${show}`}>
      <ContentWrapper>
        <div className="logo" onClick={() => navigate("/")}>
          <img src={logo} alt="" />
        </div>
      </ContentWrapper>
    </header>
  );
}

export default AdminNavbar;
