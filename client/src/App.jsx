import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchDataFromApi } from "./utils/api";
import { getApiConfiguration, getGenres } from "./store/homeSlice";

import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";
import Home from "./pages/home/Home";
import Details from "./pages/details/Details";
import SearchResult from "./pages/searchResult/SearchResult";
import Explore from "./pages/explore/Explore";
import PageNotFound from "./pages/404/pageNotFound";
import TicketBook from "./pages/TicketBook/Mainpage/TicketBook";
import MyBookings from "./pages/TicketBook/MyBookings/MyBookings";
import BookMovie from "./pages/TicketBook/BookMovie/BookMovie";
import SeatBook from "./pages/TicketBook/SeatBook/SeatBook";

import Layout from "./pages/admin/Layout";
import Dashboard from "./pages/admin/dashboard/Dashboard";
import Addshows from "./pages/admin/Addshows";
import ListShows from "./pages/admin/ListShows";
import ListBookings from "./pages/admin/ListBookings";
import { Toaster } from "react-hot-toast";

function App() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { url } = useSelector((state) => state.home);

  const isAdminRoute = location.pathname.startsWith("/admin");

  useEffect(() => {
    fetchApiConfig();
    genresCall();
  }, []);

  const fetchApiConfig = () => {
    fetchDataFromApi("/configuration").then((res) => {
      const url = {
        backdrop: res.images.secure_base_url + "original",
        poster: res.images.secure_base_url + "original",
        profile: res.images.secure_base_url + "original",
      };
      dispatch(getApiConfiguration(url));
    });
  };

  const genresCall = async () => {
    let promises = ["tv", "movie"].map((url) =>
      fetchDataFromApi(`/genre/${url}/list`)
    );
    const data = await Promise.all(promises);
    const allGenres = {};
    data.forEach(({ genres }) => {
      genres.forEach((g) => {
        allGenres[g.id] = g;
      });
    });
    dispatch(getGenres(allGenres));
  };

  return (
    <>
      <Toaster />
      {!isAdminRoute && <Header />}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/:mediaType/:id" element={<Details />} />
        <Route path="/search/:query" element={<SearchResult />} />
        <Route path="/explore/:mediaType" element={<Explore />} />
        <Route path="/book" element={<TicketBook />} />
        <Route path="/book/:movieId" element={<BookMovie />} />
        <Route path="/book/:id/:date" element={<SeatBook />} />
        <Route path="/my-bookings" element={<MyBookings />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="add-shows" element={<Addshows />} />
          <Route path="list-shows" element={<ListShows />} />
          <Route path="list-bookings" element={<ListBookings />} />
        </Route>

        <Route path="*" element={<PageNotFound />} />
      </Routes>
      {!isAdminRoute && <Footer />}
    </>
  );
}

export default App;
