import stripe from "stripe";
import Booking from "../models/Booking.js";
// import { inngest } from "../inngest/index.js";

export const stripeWebhooks = async (request, response) => {
  console.log("🔵 Webhook received at:", new Date().toISOString());
  
  const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
  const sig = request.headers["stripe-signature"];

  console.log("🔵 Stripe signature:", sig ? "Present" : "Missing");

  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(
      request.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log("✅ Webhook signature verified successfully");
    console.log("🔵 Event type:", event.type);
    console.log("🔵 Event ID:", event.id);
  } catch (error) {
    console.error("❌ Webhook signature verification failed:", error.message);
    return response.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    console.log("🔵 Processing event type:", event.type);
    
    switch (event.type) {
      case "payment_intent.succeeded": {
        console.log("🔵 Processing payment_intent.succeeded");
        
        const paymentIntent = event.data.object;
        console.log("🔵 Payment Intent ID:", paymentIntent.id);
        console.log("🔵 Payment Intent Amount:", paymentIntent.amount);
        
        console.log("🔵 Fetching checkout sessions...");
        const sessionList = await stripeInstance.checkout.sessions.list({
          payment_intent: paymentIntent.id,
        });

        console.log("🔵 Found sessions:", sessionList.data.length);
        
        if (sessionList.data.length === 0) {
          console.error("❌ No checkout session found for payment intent:", paymentIntent.id);
          break;
        }

        const session = sessionList.data[0];
        console.log("🔵 Session ID:", session.id);
        console.log("🔵 Session metadata:", session.metadata);
        
        const { bookingId } = session.metadata;
        console.log("🔵 Booking ID from metadata:", bookingId);

        if (!bookingId) {
          console.error("❌ No bookingId found in session metadata");
          break;
        }

        console.log("🔵 Updating booking:", bookingId);
        
        const updatedBooking = await Booking.findByIdAndUpdate(bookingId, {
          isPaid: true,
          paymentLink: "",
        });

        if (!updatedBooking) {
          console.error("❌ Booking not found in database:", bookingId);
          break;
        }

        console.log("✅ Booking updated successfully:", bookingId);
        console.log("🔵 Updated booking details:", {
          id: updatedBooking._id,
          isPaid: updatedBooking.isPaid,
          amount: updatedBooking.amount
        });

        // Send booking confirmation email
        console.log("🔵 TODO: Send booking confirmation email");

        break;
      }

      default:
        console.log("🔵 Unhandled event type:", event.type);
    }
    
    console.log("✅ Webhook processed successfully");
    response.json({ received: true });
    
  } catch (err) {
    console.error("❌ Webhook processing error:", err);
    console.error("❌ Error stack:", err.stack);
    response.status(500).send("Internal Server Error");
  }
};