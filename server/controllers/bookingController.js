import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import Razorpay from "razorpay";

// Setup Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET,
});

const checkSeatsAvailability = async (showId, selectedSeats) => {
  try {
    const showData = await Show.findById(showId);
    if (!showData) return false;

    const occupiedSeats = showData.occupiedSeats;
    const isAnySeatTaken = selectedSeats.some((seat) => occupiedSeats[seat]);
    return !isAnySeatTaken;
  } catch (error) {
    console.log(error.message);
    return false;
  }
};

export const createBooking = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { showId, selectedSeats } = req.body;
    const { origin } = req.headers;

    const isAvailable = await checkSeatsAvailability(showId, selectedSeats);
    if (!isAvailable) {
      return res.json({
        success: false,
        message: "Selected Seats are not available.",
      });
    }

    const showData = await Show.findById(showId).populate("movie");
    const amount = showData.showPrice * selectedSeats.length * 100; // in paise

    const booking = await Booking.create({
      user: userId,
      show: showId,
      amount: amount / 100,
      bookedSeats: selectedSeats,
    });

    // Create Razorpay order
    const razorOrder = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: booking._id.toString(),
      payment_capture: 1,
      notes: {
        showId,
        bookingId: booking._id.toString(),
      },
    });

    // Save order id in DB (optional)
    booking.paymentLink = `https://rzp.io/i/${razorOrder.id}`; // optional visualization
    await booking.save();

    // You’ll now redirect to frontend which sends this to Razorpay Checkout
    res.json({
      success: true,
      url: `${origin}/api/booking/pay/${booking._id}`,
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const getOccupiedSeats = async (req, res) => {
  try {
    const { showId } = req.params;
    const showData = await Show.findById(showId);

    const occupiedSeats = Object.keys(showData.occupiedSeats);

    res.json({ success: true, occupiedSeats });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
