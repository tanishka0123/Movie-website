import { Inngest } from "inngest";
import User from "../models/User.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "movix" });

// Inngest function to save user data to a database
const syncUserCreation = inngest.createFunction(
  { id: "user-creation" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    try {
      console.log("Creating user:", event.data);
      const { id, first_name, last_name, email_addresses, image_url } =
        event.data;
      const userData = {
        _id: id,
        email: email_addresses[0].email_address,
        name: first_name + " " + last_name,
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
  { id: "user-deletion" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    try {
      const { id } = event.data;
      console.log("🔥 Deletion event received for ID:", id);
      const deleted = await User.findByIdAndDelete(id);
      console.log("🗑️ Deleted user:", deleted);
    } catch (error) {
      console.error("❌ Error deleting user:", error);
    }
  }
);

// Inngest function to update user data
const syncUserUpdation = inngest.createFunction(
  { id: "user-updation" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    try {
      const { id, first_name, last_name, email_addresses, image_url } =
        event.data;
      const userData = {
        _id: id,
        email: email_addresses[0].email_address,
        name: first_name + " " + last_name,
        image: image_url,
      };
      console.log("Updating user:", id, userData);
      await User.findByIdAndUpdate(id, userData);
    } catch (error) {
      console.error("Error in syncUserUpdation:", error);
    }
  }
);

// Export all Inngest functions
export const functions = [syncUserCreation, syncUserDeletion, syncUserUpdation];
