import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import stripe from "stripe";

//function to check availability of selected seats for a movie
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

    // Validate input
    if (!showId || !selectedSeats) {
      console.log("Missing required fields");
      return res.json({
        success: false,
        message: "showId and selectedSeats are required",
      });
    }

    if (!Array.isArray(selectedSeats) || selectedSeats.length === 0) {
      console.log("Invalid selectedSeats format");
      return res.json({
        success: false,
        message: "selectedSeats must be a non-empty array",
      });
    }

    // Check seat availability
    console.log("Checking seat availability...");
    const isAvailable = await checkSeatsAvailability(showId, selectedSeats);

    if (!isAvailable) {
      return res.json({
        success: false,
        message: "Selected seats are not available",
      });
    }

    // Get show data
    const showData = await Show.findById(showId).populate("movie");

    if (!showData) {
      return res.json({
        success: false,
        message: "Show not found",
      });
    }

    const totalAmount = showData.showPrice * selectedSeats.length;

    // Create booking
    console.log("Creating booking...");
    const booking = await Booking.create({
      user: userId.toString(),
      show: showId.toString(),
      amount: totalAmount,
      bookedSeats: selectedSeats,
    });

    console.log("Booking created with ID:", booking._id);

    // Update occupied seats
    console.log("Updating occupied seats...");
    selectedSeats.forEach((seat) => {
      showData.occupiedSeats[seat] = userId;
    });

    showData.markModified("occupiedSeats");
    await showData.save();

    // Check if Stripe key exists
    if (!process.env.STRIPE_SECRET_KEY) {
      console.log("STRIPE_SECRET_KEY not found in environment variables");
      return res.json({
        success: false,
        message: "Payment gateway configuration error",
      });
    }

    // Initialize Stripe
    console.log("Initializing Stripe...");
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    // Create line items for stripe
    const line_items = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: showData.movie.title,
            description: `${
              selectedSeats.length
            } seat(s) - ${selectedSeats.join(", ")}`,
          },
          unit_amount: Math.floor(totalAmount * 100), // Convert to cents
        },
        quantity: 1,
      },
    ];

    // Create Stripe session
    console.log("Creating Stripe session...");
    const session = await stripeInstance.checkout.sessions.create({
      success_url: `${origin}/loading/my-bookings`,
      cancel_url: `${origin}/my-bookings`,
      line_items: line_items,
      mode: "payment",
      metadata: {
        bookingId: booking._id.toString(),
      },
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // expires in 30 mins
    });

    // Save payment link to booking
    booking.paymentLink = session.url;
    await booking.save();

    res.json({ success: true, url: session.url });
  } catch (error) {
    console.log("=== BACKEND BOOKING ERROR ===");
    console.log("Error in createBooking:", error.message);
    console.log("Error stack:", error.stack);

    // If it's a Stripe error, provide more details
    if (error.type) {
      console.log("Stripe error type:", error.type);
      console.log("Stripe error code:", error.code);
      console.log("Stripe error param:", error.param);
    }

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
