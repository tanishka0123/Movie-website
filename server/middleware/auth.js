import { clerkClient } from "@clerk/express";

// Use this as the main auth middleware
export const protectAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No token provided",
      });
    }

    const token = authHeader.substring(7);

    // Decode the JWT manually to get the userId
    let decoded;
    try {
      // Split the JWT and decode the payload
      const parts = token.split(".");
      if (parts.length !== 3) {
        throw new Error("Invalid JWT format");
      }

      const payload = parts[1];
      const decodedPayload = JSON.parse(
        Buffer.from(payload, "base64url").toString()
      );
      decoded = decodedPayload;
      console.log("Decoded JWT payload:", decoded);
    } catch (e) {
      console.log("Could not decode JWT:", e.message);
      return res.status(401).json({
        success: false,
        message: "Invalid token format",
      });
    }

    // Extract userId from the 'sub' claim (standard for Clerk)
    const userId = decoded?.sub;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Missing userId in token",
      });
    }

    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) {
      console.log("Token expired:", decoded.exp, "< now:", now);
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }

    // Verify the user exists and get their data from Clerk
    let user;
    try {
      user = await clerkClient.users.getUser(userId);
    } catch (error) {
      console.error("Error fetching user from Clerk:", error);
      return res.status(401).json({
        success: false,
        message: "Invalid user",
      });
    }

    if (user?.privateMetadata?.role !== "admin") {
      console.log("User is not admin:", user?.privateMetadata?.role);
      return res.status(403).json({
        success: false,
        message: "Not authorized as admin",
      });
    }

    req.user = user;
    req.userId = userId;
    next();
  } catch (error) {
    console.error("protectAdmin error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
