import { Inngest } from "inngest";
import User from "../models/User.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "movie-ticket-booking" });

// Inngest function to save user data to a database
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-creation" },
  { event: "clerk.user.created" },
  async ({ event }) => {
    try {
      console.log("Creating user:", event.data);
      const { id, first_name, last_name, email_addresses, image_url } =
        event.data;
      const userData = {
        id,
        email: email_addresses[0].email_address,
        name: `${first_name} ${last_name}`,
        image: image_url,
      };
      await User.create(userData);
      console.log("User created:", userData);
    } catch (error) {
      console.error("Error in syncUserCreation:", error);
    }
  }
);

// Inngest function to delete user data
const syncUserDeletion = inngest.createFunction(
  { id: "sync-user-deletion" },
  { event: "clerk.user.deleted" },
  async ({ event }) => {
    try {
      const { id } = event.data;
      console.log("Deleting user with id:", id);
      await User.findOneAndDelete({ id });
    } catch (error) {
      console.error("Error in syncUserDeletion:", error);
    }
  }
);

// Inngest function to update user data
const syncUserUpdation = inngest.createFunction(
  { id: "sync-user-updation" },
  { event: "clerk.user.updated" },
  async ({ event }) => {
    try {
      const { id, first_name, last_name, email_addresses, image_url } =
        event.data;
      const userData = {
        id,
        email: email_addresses[0].email_address,
        name: `${first_name} ${last_name}`,
        image: image_url,
      };
      console.log("Updating user:", id, userData);
      await User.findOneAndUpdate({ id }, userData, { new: true });
    } catch (error) {
      console.error("Error in syncUserUpdation:", error);
    }
  }
);

// Export all Inngest functions
export const functions = [syncUserCreation, syncUserDeletion, syncUserUpdation];
