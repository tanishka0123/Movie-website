import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import stripe from "stripe";

// Function to check availability of selected seats for a movie
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

// Function to clean up expired bookings and release seats
const cleanupExpiredBookings = async () => {
  try {
    const expiredBookings = await Booking.findExpiredBookings();
    
    for (const booking of expiredBookings) {
      // Release seats for expired bookings
      const show = await Show.findById(booking.show);
      if (show) {
        booking.bookedSeats.forEach(seat => {
          if (show.occupiedSeats[seat] === booking.user) {
            delete show.occupiedSeats[seat];
          }
        });
        show.markModified('occupiedSeats');
        await show.save();
      }
      
      // Mark booking as expired
      booking.status = 'expired';
      await booking.save();
    }
    
    console.log(`Cleaned up ${expiredBookings.length} expired bookings`);
  } catch (error) {
    console.error('Error cleaning up expired bookings:', error);
  }
};

export const createBooking = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { showId, selectedSeats, contactEmail, contactPhone } = req.body;
    const { origin } = req.headers;

    // Clean up expired bookings first
    await cleanupExpiredBookings();

    // Check if the seat is available for the selected show
    const isAvailable = await checkSeatsAvailability(showId, selectedSeats);
    if (!isAvailable) {
      return res.json({
        success: false,
        message: "Selected seats are not available.",
      });
    }

    // Get the show details
    const showData = await Show.findById(showId).populate("movie");
    if (!showData) {
      return res.json({
        success: false,
        message: "Show not found.",
      });
    }

    // Create a new booking with improved model
    const booking = await Booking.create({
      user: userId,
      show: showId,
      amount: showData.showPrice * selectedSeats.length,
      bookedSeats: selectedSeats,
      contactEmail,
      contactPhone,
      status: 'pending'
    });

    // Reserve seats
    selectedSeats.forEach((seat) => {
      showData.occupiedSeats[seat] = userId;
    });
    showData.markModified("occupiedSeats");
    await showData.save();

    // Stripe Gateway Initialize
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    // Creating line items for stripe
    const line_items = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${showData.movie.title} - ${selectedSeats.length} seat(s)`,
            description: `Seats: ${selectedSeats.join(', ')}`,
          },
          unit_amount: Math.floor(booking.amount * 100), // Convert to cents
        },
        quantity: 1,
      },
    ];

    const session = await stripeInstance.checkout.sessions.create({
      success_url: `${origin}/loading/my-bookings`,
      cancel_url: `${origin}/my-bookings`,
      line_items: line_items,
      mode: "payment",
      metadata: {
        bookingId: booking._id.toString(),
        userId: userId,
        showId: showId.toString(),
      },
      customer_email: contactEmail,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // Expires in 30 minutes
    });

    // Update booking with payment link and stripe session ID
    booking.paymentLink = session.url;
    booking.stripeSessionId = session.id;
    await booking.save();

    res.json({ 
      success: true, 
      url: session.url,
      bookingId: booking._id,
      bookingReference: booking.bookingReference
    });

  } catch (error) {
    console.error('Error creating booking:', error);
    res.json({ success: false, message: error.message });
  }
};

export const getOccupiedSeats = async (req, res) => {
  try {
    const { showId } = req.params;
    
    // Clean up expired bookings first
    await cleanupExpiredBookings();
    
    const showData = await Show.findById(showId);
    if (!showData) {
      return res.json({
        success: false,
        message: "Show not found.",
      });
    }

    const occupiedSeats = Object.keys(showData.occupiedSeats);

    res.json({ success: true, occupiedSeats });
  } catch (error) {
    console.error('Error getting occupied seats:', error);
    res.json({ success: false, message: error.message });
  }
};

// New endpoint to get user's bookings with improved queries
export const getUserBookings = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { status, page = 1, limit = 10 } = req.query;

    const query = { user: userId };
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate({
        path: 'show',
        populate: {
          path: 'movie',
          select: 'title poster_path runtime'
        }
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error getting user bookings:', error);
    res.json({ success: false, message: error.message });
  }
};

// New endpoint to cancel a booking
export const cancelBooking = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { bookingId } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findOne({
      _id: bookingId,
      user: userId
    }).populate('show');

    if (!booking) {
      return res.json({
        success: false,
        message: "Booking not found.",
      });
    }

    if (!booking.canBeCancelled) {
      return res.json({
        success: false,
        message: "This booking cannot be cancelled.",
      });
    }

    // Cancel the booking
    await booking.cancel(reason);

    // Release the seats
    if (booking.show) {
      booking.bookedSeats.forEach(seat => {
        if (booking.show.occupiedSeats[seat] === userId) {
          delete booking.show.occupiedSeats[seat];
        }
      });
      booking.show.markModified('occupiedSeats');
      await booking.show.save();
    }

    res.json({
      success: true,
      message: "Booking cancelled successfully.",
    });

  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.json({ success: false, message: error.message });
  }
};

// New endpoint to get booking details
export const getBookingDetails = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { bookingId } = req.params;

    const booking = await Booking.findOne({
      _id: bookingId,
      user: userId
    }).populate({
      path: 'show',
      populate: {
        path: 'movie',
        select: 'title poster_path runtime overview'
      }
    });

    if (!booking) {
      return res.json({
        success: false,
        message: "Booking not found.",
      });
    }

    res.json({
      success: true,
      booking
    });

  } catch (error) {
    console.error('Error getting booking details:', error);
    res.json({ success: false, message: error.message });
  }
};