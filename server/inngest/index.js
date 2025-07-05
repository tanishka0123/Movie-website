import { Inngest } from "inngest";
import User from "../models/User.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "movie-ticket-booking" });

//Inngest function to save usser data to a database
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-creation" },
  { event: "clerk.user.created" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } =
      event.data;
    const userData = {
      id: id,
      email: email_addresses[0].email_address,
      name: `${first_name} ${last_name}`,
      image: image_url,
    };
    await User.create(userData);
  }
);

// Inngest function to delete user data in the database
const syncUserDeletion = inngest.createFunction(
  { id: "sync-user-deletion" },
  { event: "clerk.user.deleted" },
  async ({ event }) => {
    const { id } = event.data;
    await User.findByIdAndDelete({id});
  }
);

// Inngest function to update user data in the database
const syncUserUpdation = inngest.createFunction(
  { id: "sync-user-updation" },
  { event: "clerk.user.updated" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } =
      event.data;

    const userData = {
      id: id,
      email: email_addresses[0].email_address,
      name: `${first_name} ${last_name}`,
      image: image_url,
    };

    await User.findByIdAndUpdate({id}, userData, { new: true });
  }
);

// Create an empty array where we'll export future Inngest functions
export const functions = [syncUserCreation, syncUserDeletion, syncUserUpdation];
