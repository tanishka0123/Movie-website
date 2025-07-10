import stripe from "stripe";
import Booking from "../models/Booking.js"; // Adjust path as needed

const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhooks = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const sig = req.headers["stripe-signature"];
  let event;

  try {
    // Get raw body
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
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        console.log("💳 Payment succeeded:", paymentIntent.id);

        const sessionList = await stripeInstance.checkout.sessions.list({
          payment_intent: paymentIntent.id,
        });

        if (sessionList.data.length > 0) {
          const session = sessionList.data[0];
          const { bookingId } = session.metadata;

          console.log("📝 Updating booking:", bookingId);

          await Booking.findByIdAndUpdate(bookingId, {
            isPaid: true,
            paymentLink: "",
          });

          console.log("✅ Booking updated successfully");
        }
        break;
      }

      default:
        console.log("Unhandled event type:", event.type);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error("❌ Webhook processing error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
