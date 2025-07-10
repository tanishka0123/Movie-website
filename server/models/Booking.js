import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: { 
      type: String, 
      required: true, 
      ref: "User",
      index: true // Add index for faster queries
    },
    show: { 
      type: mongoose.Schema.Types.ObjectId, 
      required: true, 
      ref: "Show",
      index: true
    },
    amount: { 
      type: Number, 
      required: true,
      min: 0
    },
    bookedSeats: { 
      type: [String], 
      required: true,
      validate: {
        validator: function(seats) {
          return seats.length > 0;
        },
        message: 'At least one seat must be booked'
      }
    },
    
    // Payment related fields
    isPaid: { 
      type: Boolean, 
      default: false,
      index: true
    },
    paymentLink: { 
      type: String 
    },
    paymentIntentId: { 
      type: String,
      index: true
    },
    paidAt: { 
      type: Date 
    },
    
    // Booking status
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'expired'],
      default: 'pending',
      index: true
    },
    
    // Cancellation details
    cancelledAt: { 
      type: Date 
    },
    cancellationReason: { 
      type: String 
    },
    
    // Expiration handling
    expiresAt: {
      type: Date,
      default: function() {
        // Set expiration to 30 minutes from creation
        return new Date(Date.now() + 30 * 60 * 1000);
      },
      index: { expireAfterSeconds: 0 } // MongoDB TTL index
    },
    
    // Additional metadata
    bookingReference: {
      type: String,
      unique: true,
      default: function() {
        return 'BK' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
      }
    },
    
    // Stripe session details
    stripeSessionId: {
      type: String
    },
    
    // Contact information (if needed)
    contactEmail: {
      type: String
    },
    contactPhone: {
      type: String
    }
  },
  { 
    timestamps: true,
    // Add indexes for common queries
    indexes: [
      { user: 1, createdAt: -1 },
      { show: 1, status: 1 },
      { bookingReference: 1 }
    ]
  }
);

// Pre-save middleware to update status based on payment
bookingSchema.pre('save', function(next) {
  if (this.isPaid && this.status === 'pending') {
    this.status = 'confirmed';
    if (!this.paidAt) {
      this.paidAt = new Date();
    }
  }
  next();
});

// Instance method to check if booking is expired
bookingSchema.methods.isExpired = function() {
  return this.expiresAt && new Date() > this.expiresAt;
};

// Instance method to cancel booking
bookingSchema.methods.cancel = function(reason = 'User cancelled') {
  this.status = 'cancelled';
  this.cancelledAt = new Date();
  this.cancellationReason = reason;
  return this.save();
};

// Instance method to confirm payment
bookingSchema.methods.confirmPayment = function(paymentIntentId) {
  this.isPaid = true;
  this.paidAt = new Date();
  this.status = 'confirmed';
  this.paymentIntentId = paymentIntentId;
  this.paymentLink = ''; // Clear payment link
  return this.save();
};

// Static method to find expired bookings
bookingSchema.statics.findExpiredBookings = function() {
  return this.find({
    status: 'pending',
    isPaid: false,
    expiresAt: { $lt: new Date() }
  });
};

// Static method to get user's active bookings
bookingSchema.statics.getUserActiveBookings = function(userId) {
  return this.find({
    user: userId,
    status: { $in: ['pending', 'confirmed'] }
  }).populate('show');
};

// Virtual for formatted booking reference
bookingSchema.virtual('formattedReference').get(function() {
  return this.bookingReference;
});

// Virtual to check if booking can be cancelled
bookingSchema.virtual('canBeCancelled').get(function() {
  if (this.status === 'cancelled' || this.status === 'expired') {
    return false;
  }
  
  // You can add more business logic here
  // For example, no cancellation within 2 hours of show time
  return true;
});

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;