import express from "express";
import {
  cancelBooking,
  createBooking,
  getBookingDetails,
  getOccupiedSeats,
  getUserBookings,
} from "../controllers/bookingController.js";

const bookingRouter = express.Router();

bookingRouter.post("/create", createBooking);
bookingRouter.get("/seats/:showId", getOccupiedSeats);
// Add these to your booking routes
bookingRouter.get("/user-bookings", getUserBookings);
bookingRouter.post("/cancel/:bookingId", cancelBooking);
bookingRouter.get("/details/:bookingId", getBookingDetails);

export default bookingRouter;
