import stripe from "stripe";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
// import { inngest } from "../inngest/index.js";

export const stripeWebhooks = async (request, response) => {
  const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
  const sig = request.headers["stripe-signature"];

  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(
      request.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error.message);
    return response.status(400).send(`Webhook Error: ${error.message}`);
  }

  // Respond immediately to Stripe
  response.json({ received: true });

  // Process the event asynchronously
  try {
    await processWebhookEvent(event, stripeInstance);
  } catch (error) {
    console.error("Error processing webhook event:", error);
  }
};

async function processWebhookEvent(event, stripeInstance) {
  console.log(`Processing webhook event: ${event.type} - ${event.id}`);
  
  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object;
      console.log(`Payment intent succeeded: ${paymentIntent.id}`);
      
      try {
        // Find the checkout session associated with this payment intent
        const sessions = await stripeInstance.checkout.sessions.list({
          payment_intent: paymentIntent.id,
          limit: 1
        });

        if (sessions.data.length === 0) {
          console.error(`No checkout session found for payment intent: ${paymentIntent.id}`);
          return;
        }

        const session = sessions.data[0];
        const { bookingId } = session.metadata;

        if (!bookingId) {
          console.error(`No bookingId found in session metadata for payment intent: ${paymentIntent.id}`);
          return;
        }

        // Find and update the booking using the new confirmPayment method
        const booking = await Booking.findById(bookingId);
        
        if (!booking) {
          console.error(`Booking not found: ${bookingId}`);
          return;
        }

        if (booking.isPaid) {
          console.log(`Booking ${bookingId} is already paid`);
          return;
        }

        // Use the new confirmPayment method
        await booking.confirmPayment(paymentIntent.id);

        console.log(`Booking confirmed successfully: ${bookingId}`);

        // TODO: Send booking confirmation email
        // await sendBookingConfirmationEmail(booking);

      } catch (error) {
        console.error("Error processing payment_intent.succeeded:", error);
        throw error;
      }
      break;
    }

    case "checkout.session.completed": {
      const session = event.data.object;
      console.log(`Checkout session completed: ${session.id}`);
      
      try {
        const { bookingId } = session.metadata;

        if (!bookingId) {
          console.error(`No bookingId found in session metadata: ${session.id}`);
          return;
        }

        // Update booking with stripe session ID
        await Booking.findByIdAndUpdate(bookingId, {
          stripeSessionId: session.id
        });

        console.log(`Stripe session ID updated for booking: ${bookingId}`);

      } catch (error) {
        console.error("Error processing checkout.session.completed:", error);
        throw error;
      }
      break;
    }

    case "checkout.session.expired": {
      const session = event.data.object;
      console.log(`Checkout session expired: ${session.id}`);
      
      try {
        const { bookingId } = session.metadata;

        if (!bookingId) {
          console.error(`No bookingId found in expired session metadata: ${session.id}`);
          return;
        }

        const booking = await Booking.findById(bookingId).populate('show');
        
        if (!booking) {
          console.error(`Booking not found for expired session: ${bookingId}`);
          return;
        }

        if (booking.isPaid) {
          console.log(`Booking ${bookingId} is already paid, ignoring expiration`);
          return;
        }

        // Mark booking as expired and release seats
        booking.status = 'expired';
        await booking.save();

        // Release the occupied seats
        await releaseSeats(booking);

        console.log(`Booking expired and seats released: ${bookingId}`);

      } catch (error) {
        console.error("Error processing checkout.session.expired:", error);
        throw error;
      }
      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object;
      console.log(`Payment failed: ${paymentIntent.id}`);
      
      try {
        // Find the checkout session
        const sessions = await stripeInstance.checkout.sessions.list({
          payment_intent: paymentIntent.id,
          limit: 1
        });

        if (sessions.data.length > 0) {
          const session = sessions.data[0];
          const { bookingId } = session.metadata;

          if (bookingId) {
            console.log(`Payment failed for booking: ${bookingId}`);
            // You might want to send a notification to the user
            // but don't immediately expire the booking as they might retry
          }
        }

      } catch (error) {
        console.error("Error processing payment_intent.payment_failed:", error);
        throw error;
      }
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
}

// Helper function to release seats when booking expires or fails
async function releaseSeats(booking) {
  try {
    if (!booking.show) {
      console.error(`No show found for booking: ${booking._id}`);
      return;
    }

    const show = await Show.findById(booking.show);
    
    if (!show) {
      console.error(`Show not found: ${booking.show}`);
      return;
    }

    // Release each booked seat
    booking.bookedSeats.forEach(seat => {
      if (show.occupiedSeats[seat] === booking.user) {
        delete show.occupiedSeats[seat];
      }
    });

    show.markModified('occupiedSeats');
    await show.save();

    console.log(`Released ${booking.bookedSeats.length} seats for booking: ${booking._id}`);
    
  } catch (error) {
    console.error('Error releasing seats:', error);
    throw error;
  }
}