import { Inngest } from "inngest";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";

export const inngest = new Inngest({ id: "movix" });

// Helper function to safely extract user data
const extractUserData = (eventData) => {
  const { id, first_name, last_name, email_addresses, image_url } = eventData;

  // Validate required fields
  if (!id) {
    throw new Error("User ID is required");
  }

  if (!email_addresses || email_addresses.length === 0) {
    throw new Error("Email address is required");
  }

  return {
    _id: id,
    email: email_addresses[0].email_address,
    name: `${first_name || ""} ${last_name || ""}`.trim() || "Unknown User",
    image: image_url || "", // Handle missing image gracefully
  };
};

// Inngest function to save user data to a database
const syncUserCreation = inngest.createFunction(
  {
    id: "user-creation",
    retries: 3, // Add retry configuration
  },
  { event: "clerk/user.created" },
  async ({ event, step }) => {
    return await step.run("create-user", async () => {
      try {
        console.log("Creating user:", event.data);

        const userData = extractUserData(event.data);

        // Check if user already exists
        const existingUser = await User.findById(userData._id);
        if (existingUser) {
          console.log("User already exists:", userData._id);
          return { success: true, message: "User already exists" };
        }

        const newUser = await User.create(userData);
        console.log("User created successfully:", newUser);

        return { success: true, user: newUser };
      } catch (error) {
        console.error("Error in syncUserCreation:", error);

        // Re-throw with more context
        throw new Error(`Failed to create user: ${error.message}`);
      }
    });
  }
);

// Inngest function to delete user data
const syncUserDeletion = inngest.createFunction(
  {
    id: "user-deletion",
    retries: 3,
  },
  { event: "clerk/user.deleted" },
  async ({ event, step }) => {
    return await step.run("delete-user", async () => {
      try {
        const { id } = event.data;

        if (!id) {
          throw new Error("User ID is required for deletion");
        }

        console.log("🔥 Deletion event received for ID:", id);

        const deleted = await User.findByIdAndDelete(id);

        if (!deleted) {
          console.log("⚠️ User not found for deletion:", id);
          return { success: true, message: "User not found (already deleted)" };
        }

        console.log("🗑️ Deleted user:", deleted);
        return { success: true, deletedUser: deleted };
      } catch (error) {
        console.error("❌ Error deleting user:", error);
        throw new Error(`Failed to delete user: ${error.message}`);
      }
    });
  }
);

// Inngest function to update user data
const syncUserUpdation = inngest.createFunction(
  {
    id: "user-updation",
    retries: 3,
  },
  { event: "clerk/user.updated" },
  async ({ event, step }) => {
    return await step.run("update-user", async () => {
      try {
        const userData = extractUserData(event.data);

        console.log("Updating user:", userData._id, userData);

        // Use upsert to handle cases where user might not exist
        const updatedUser = await User.findByIdAndUpdate(
          userData._id,
          userData,
          {
            new: true,
            upsert: true, // Create if doesn't exist
            runValidators: true,
          }
        );

        console.log("User updated successfully:", updatedUser);
        return { success: true, user: updatedUser };
      } catch (error) {
        console.error("Error in syncUserUpdation:", error);
        throw new Error(`Failed to update user: ${error.message}`);
      }
    });
  }
);

// Optional: Function to handle session events (if needed)
const handleSessionCreated = inngest.createFunction(
  { id: "session-created" },
  { event: "clerk/session.created" },
  async ({ event, step }) => {
    return await step.run("log-session", async () => {
      console.log("Session created:", event.data);
      // Add any session-specific logic here
      return { success: true };
    });
  }
);

const handleSessionRemoved = inngest.createFunction(
  { id: "session-removed" },
  { event: "clerk/session.removed" },
  async ({ event, step }) => {
    return await step.run("log-session", async () => {
      console.log("Session removed:", event.data);
      // Add any session cleanup logic here
      return { success: true };
    });
  }
);

//inngest function to cancel booking and release seats of shows after 10 minutes of creatted if payment is not made
const releaseSeatsAndDeleteBooking = inngest.createFunction(
  { id: "release-seats-delete-booking" },
  { event: "app/checkpayment" },
  async ({ event, step }) => {
    const tenMinutesLater = new Date(Date.now() + 10 * 60 * 1000);
    await step.sleepUntil("wait-for-10-minutes", tenMinutesLater);
    await step.run("check-payment-status", async () => {
      const bookingId = event.data.bookingId;
      const booking = await Booking.findById(bookingId);
      if (!booking.isPaid) {
        const show = await Show.findById(booking.show);
        booking.bookedSeats.forEach((seat) => {
          delete show.occupiedSeats[seat];
        });
        show.markModified("occupiedSeats");
        await show.save();
        await Booking.findByIdAndDelete(booking._id);
      }
    });
  }
);

// Export all Inngest functions
export const functions = [
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdation,
  // Uncomment if you want to handle session events
  handleSessionCreated,
  handleSessionRemoved,
  releaseSeatsAndDeleteBooking,
];
