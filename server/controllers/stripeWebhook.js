import stripe from "stripe";
import Booking from "../models/Booking.js";

const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhooks = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const sig = req.headers["stripe-signature"];
  let event;

  try {
    const buf = Buffer.from(req.body);
    event = stripeInstance.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    console.log("✅ Webhook verified:", event.type);
  } catch (error) {
    console.log("❌ Webhook signature verification failed:", error.message);
    return res.status(400).json({ error: `Webhook Error: ${error.message}` });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        
        console.log("🎯 Checkout session completed:", session.id);
        console.log("💰 Payment status:", session.payment_status);
        console.log("📊 Session metadata:", session.metadata);
        
        // Only process if payment was successful
        if (session.payment_status === "paid") {
          const { bookingId } = session.metadata;
          
          console.log("💳 Payment completed for session:", session.id);
          console.log("📝 Updating booking:", bookingId);
          
          if (bookingId) {
            try {
              const updatedBooking = await Booking.findByIdAndUpdate(
                bookingId,
                {
                  isPaid: true,
                  paymentLink: "",
                  stripeSessionId: session.id,
                  paymentIntentId: session.payment_intent,
                },
                { new: true }
              );
              
              if (updatedBooking) {
                console.log("✅ Booking updated successfully:", bookingId);
                console.log("📋 Updated booking isPaid:", updatedBooking.isPaid);
              } else {
                console.log("❌ Booking not found:", bookingId);
              }
            } catch (updateError) {
              console.log("❌ Error updating booking:", updateError.message);
            }
          } else {
            console.log("❌ No bookingId found in session metadata");
          }
        } else {
          console.log("⚠️ Payment not completed, status:", session.payment_status);
        }
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        console.log("💳 Payment intent succeeded:", paymentIntent.id);
        
        // Fallback: Try to find booking by payment intent if session webhook fails
        try {
          const sessionList = await stripeInstance.checkout.sessions.list({
            payment_intent: paymentIntent.id,
            limit: 1
          });

          if (sessionList.data.length > 0) {
            const session = sessionList.data[0];
            const { bookingId } = session.metadata;

            if (bookingId) {
              // Check if booking is already marked as paid
              const existingBooking = await Booking.findById(bookingId);
              
              if (existingBooking && !existingBooking.isPaid) {
                console.log("📝 Fallback: Updating booking via payment_intent:", bookingId);
                
                await Booking.findByIdAndUpdate(bookingId, {
                  isPaid: true,
                  paymentLink: "",
                  stripeSessionId: session.id,
                  paymentIntentId: paymentIntent.id,
                });

                console.log("✅ Fallback: Booking updated successfully");
              } else {
                console.log("ℹ️ Booking already processed or not found");
              }
            }
          }
        } catch (fallbackError) {
          console.log("❌ Fallback processing failed:", fallbackError.message);
        }
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object;
        const { bookingId } = session.metadata;
        
        console.log("⏰ Session expired for booking:", bookingId);
        
        if (bookingId) {
          // Optionally handle expired sessions
          // You might want to mark the booking as expired or clean up
          console.log("📝 Handling expired session for booking:", bookingId);
        }
        break;
      }

      default:
        console.log("ℹ️ Unhandled event type:", event.type);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error("❌ Webhook processing error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};