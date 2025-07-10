import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import stripe from "stripe";

// Function to check availability of selected seats for a movie
const checkSeatsAvailability = async (showId, selectedSeats) => {
  try {
    console.log("🔵 Checking seat availability for show:", showId);
    console.log("🔵 Seats to check:", selectedSeats);
    
    const showData = await Show.findById(showId);
    if (!showData) {
      console.log("❌ Show not found");
      return false;
    }

    console.log("🔵 Current occupied seats:", Object.keys(showData.occupiedSeats));
    
    const occupiedSeats = showData.occupiedSeats;
    const isAnySeatTaken = selectedSeats.some((seat) => occupiedSeats[seat]);

    console.log("🔵 Any seat taken:", isAnySeatTaken);
    
    return !isAnySeatTaken;
  } catch (error) {
    console.error("❌ Error checking seat availability:", error);
    return false;
  }
};

export const createBooking = async (req, res) => {
  try {
    console.log("🔵 Creating booking - Start");
    
    const { userId } = req.auth();
    const { showId, selectedSeats } = req.body;
    const { origin } = req.headers;

    console.log("🔵 User ID:", userId);
    console.log("🔵 Show ID:", showId);
    console.log("🔵 Selected seats:", selectedSeats);
    console.log("🔵 Origin:", origin);

    // Check if the seat is available for the selected show
    console.log("🔵 Checking seat availability...");
    const isAvailable = await checkSeatsAvailability(showId, selectedSeats);
    console.log("🔵 Seats available:", isAvailable);
    
    if (!isAvailable) {
      console.log("❌ Seats not available");
      return res.json({
        success: false,
        message: "Selected Seats are not available.",
      });
    }

    // Get the show details
    console.log("🔵 Fetching show details...");
    const showData = await Show.findById(showId).populate("movie");
    console.log("🔵 Show data:", showData ? "Found" : "Not found");
    console.log("🔵 Show price:", showData?.showPrice);
    console.log("🔵 Movie title:", showData?.movie?.title);

    // Create a new booking
    console.log("🔵 Creating booking record...");
    const booking = await Booking.create({
      user: userId,
      show: showId,
      amount: showData.showPrice * selectedSeats.length,
      bookedSeats: selectedSeats,
    });

    console.log("✅ Booking created:", booking._id);
    console.log("🔵 Booking amount:", booking.amount);

    console.log("🔵 Updating occupied seats...");
    selectedSeats.map((seat) => {
      showData.occupiedSeats[seat] = userId;
    });

    showData.markModified("occupiedSeats");
    await showData.save();
    console.log("✅ Occupied seats updated");

    // Stripe Gateway Initialize
    console.log("🔵 Initializing Stripe...");
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    // Creating line items to for stripe
    const line_items = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: showData.movie.title,
          },
          unit_amount: Math.floor(booking.amount) * 100,
        },
        quantity: 1,
      },
    ];

    console.log("🔵 Line items:", line_items);

    console.log("🔵 Creating Stripe checkout session...");
    const session = await stripeInstance.checkout.sessions.create({
      success_url: `${origin}/loading/my-bookings`,
      cancel_url: `${origin}/my-bookings`,
      line_items: line_items,
      mode: "payment",
      metadata: {
        bookingId: booking._id.toString(),
      },
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // Expires in 30 minutes
    });

    console.log("✅ Stripe session created:", session.id);
    console.log("🔵 Session URL:", session.url);
    console.log("🔵 Session metadata:", session.metadata);

    booking.paymentLink = session.url;
    await booking.save();
    console.log("✅ Booking updated with payment link");

    // Run Inngest Sheduler Function to check payment status
    console.log("🔵 TODO: Run Inngest Scheduler Function");

    console.log("✅ Booking creation completed successfully");
    res.json({ success: true, url: session.url });
    
  } catch (error) {
    console.error("❌ Error creating booking:", error);
    console.error("❌ Error stack:", error.stack);
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
