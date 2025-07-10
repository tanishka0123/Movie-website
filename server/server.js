import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./configs/db.js";
import { clerkMiddleware } from "@clerk/express";
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";
import showRouter from "./routes/showRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import userRouter from "./routes/userRoutes.js";
import { stripeWebhooks } from "./controllers/stripeWebhook.js";

const app = express();
const port = 3000;

await connectDB();
// Add after connectDB()
console.log("🔵 Environment check:");
console.log("🔵 STRIPE_SECRET_KEY:", process.env.STRIPE_SECRET_KEY ? "Present" : "Missing");
console.log("🔵 STRIPE_WEBHOOK_SECRET:", process.env.STRIPE_WEBHOOK_SECRET ? "Present" : "Missing");

// IMPORTANT: Stripe webhook route MUST come before other middleware
// Stripe webhooks need raw body and no authentication
app.use("/api/stripe", (req, res, next) => {
  console.log("🔵 Stripe webhook endpoint hit");
  console.log("🔵 Method:", req.method);
  console.log("🔵 Headers:", req.headers);
  next();
}, express.raw({ type: "application/json" }), stripeWebhooks);

// Middleware (applied to all routes below this point)
app.use(express.json());
app.use(cors());
app.use(
  clerkMiddleware({
    debug: true, // Enable debug mode
    secretKey: process.env.CLERK_SECRET_KEY,
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  })
);

// Routes (these will have Clerk middleware applied)
app.get("/", (req, res) => res.send("Server is live"));
app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/show", showRouter);
app.use("/api/booking", bookingRouter);
app.use("/api/admin", adminRouter);
app.use("/api/user", userRouter);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});