import Booking from "../models/Booking.js";

//api controller function to get user bookings
export const getUserBookings = async (req, res) => {
  try {
    const { userId } = req.auth();
    const bookings = await Booking.find({ user: userId })
      .populate({
        path: "show",
        populate: {
          path: "movie",
        },
      })
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
