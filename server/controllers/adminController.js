import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import User from "../models/User.js";
import { clerkClient } from "@clerk/express";

// API to check if user is admin
export const isAdmin = async (req, res) => {
  res.json({ success: true, isAdmin: true });
};

// API to get dashboard data
export const getDashboardData = async (req, res) => {
  try {
    const bookings = await Booking.find({ isPaid: true });
    const activeShows = await Show.find({
      showDateTime: { $gte: new Date() },
    }).populate("movie");

    const totalUser = await User.countDocuments();

    const dashboardData = {
      totalBookings: bookings.length,
      totalRevenue: bookings.reduce((acc, booking) => acc + booking.amount, 0),
      activeShows,
      totalUser,
    };

    res.json({ success: true, dashboardData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get all shows
export const getAllShows = async (req, res) => {
  try {
    const shows = await Show.find({ showDateTime: { $gte: new Date() } })
      .populate("movie")
      .sort({ showDateTime: 1 });
    res.json({ success: true, shows });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get all bookings
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate("user")
      .populate({
        path: "show",
        populate: { path: "movie" },
      })
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get all users from Clerk
export const getAllUsers = async (req, res) => {
  try {
    const users = await clerkClient.users.getUserList({
      limit: 100, // Adjust as needed
      orderBy: '-created_at'
    });
    
    res.json({ success: true, users: users.data });
  } catch (error) {
    console.log('Error fetching users:', error);
    res.json({ success: false, message: error.message });
  }
};

// API to update user role (make admin or remove admin)
export const updateUserRole = async (req, res) => {
  try {
    const { userId, action } = req.body;

    if (!userId || !action) {
      return res.json({
        success: false,
        message: "User ID and action are required",
      });
    }

    if (!['make-admin', 'remove-admin'].includes(action)) {
      return res.json({
        success: false,
        message: "Invalid action. Use 'make-admin' or 'remove-admin'",
      });
    }

    // Get current user data
    const user = await clerkClient.users.getUser(userId);
    
    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    // Prepare the metadata update
    let privateMetadataUpdate;
    
    if (action === 'make-admin') {
      // Add admin role
      privateMetadataUpdate = {
        ...user.privateMetadata,
        role: 'admin'
      };
    } else {
      // Remove admin role - set to null explicitly
      privateMetadataUpdate = {
        ...user.privateMetadata,
        role: null
      };
    }

    // Update user's private metadata
    await clerkClient.users.updateUserMetadata(userId, {
      privateMetadata: privateMetadataUpdate,
    });

    // Verify the update by fetching the user again
    const updatedUser = await clerkClient.users.getUser(userId);
    console.log('Updated user metadata:', updatedUser.privateMetadata);

    const message = action === 'make-admin' 
      ? 'User has been granted admin privileges' 
      : 'Admin privileges have been revoked';

    res.json({
      success: true,
      message,
      updatedMetadata: updatedUser.privateMetadata, // Send back the updated metadata for verification
    });

  } catch (error) {
    console.log('Error updating user role:', error);
    res.json({
      success: false,
      message: error.message || 'Failed to update user role',
    });
  }
};