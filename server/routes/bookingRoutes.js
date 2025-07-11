import express from "express";
import {
  createBooking,
  getOccupiedSeats,
} from "../controllers/bookingController.js";

const bookingRouter = express.Router();

bookingRouter.post("/create", createBooking);
bookingRouter.get("/seats/:showId", getOccupiedSeats);
bookingRouter.get("/pay/:bookingId", async (req, res) => {
  const Booking = (await import("../models/Booking.js")).default;
  const User = (await import("../models/User.js")).default;
  const Show = (await import("../models/Show.js")).default;
  const Razorpay = (await import("razorpay")).default;

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_API_SECRET,
  });

  try {
    const booking = await Booking.findById(req.params.bookingId).populate(
      "show"
    );
    if (!booking) return res.send("Booking not found");

    const show = await Show.findById(booking.show);
    const user = await User.findById(booking.user);

    const order = await razorpay.orders.create({
      amount: booking.amount * 100,
      currency: "INR",
      receipt: booking._id.toString(),
      payment_capture: 1,
    });

    // Simple HTML Checkout (or use client SDK)
    res.send(`
      <html>
        <head><title>Pay</title></head>
        <body>
          <script src="https://checkout.razorpay.com/v1/checkout.js"
            data-key="${process.env.RAZORPAY_API_KEY}"
            data-amount="${booking.amount * 100}"
            data-currency="INR"
            data-order_id="${order.id}"
            data-buttontext="Pay with Razorpay"
            data-name="Show&Book"
            data-description="${show.movie}"
            data-image="/logo.png"
            data-prefill.name="${user.name}"
            data-prefill.email="${user.email}"
            data-theme.color="#3399cc"
            data-callback_url="/api/booking/payment-success/${booking._id}">
          </script>
          <p>If you are not redirected, <a href="/">click here</a>.</p>
        </body>
      </html>
    `);
  } catch (err) {
    res.send("Error: " + err.message);
  }
});

export default bookingRouter;
