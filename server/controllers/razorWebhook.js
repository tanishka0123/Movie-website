import Razorpay from "razorpay";
import crypto from "crypto";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";

export const razorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    const signature = req.headers["x-razorpay-signature"];
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (signature !== expectedSignature) {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    const event = req.body.event;
    const paymentLink = req.body.payload?.payment_link?.entity;
    const bookingId = paymentLink?.notes?.bookingId;

    if (!bookingId) {
      return res.status(400).json({ success: false, message: "Booking ID missing in notes" });
    }

    const booking = await Booking.findById(bookingId).populate("show");
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    switch (event) {
      case "payment_link.paid":
        booking.isPaid = true;
        await booking.save();
        return res.json({ success: true, message: "Booking confirmed" });

      case "payment_link.expired":
      case "payment_link.cancelled":
        const show = await Show.findById(booking.show);
        booking.bookedSeats.forEach((seat) => {
          delete show.occupiedSeats[seat];
        });
        show.markModified("occupiedSeats");
        await show.save();
        await booking.deleteOne();
        return res.json({ success: true, message: "Booking removed due to payment cancellation/expiry" });

      case "payment.failed":
        return res.json({ success: true, message: "Payment failed. Booking still pending." });

      default:
        return res.status(400).json({ success: false, message: "Unhandled event" });
    }
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ success: false, message: "Webhook processing failed" });
  }
};
