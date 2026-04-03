const mongoose = require("mongoose");

const OAuthTicketSchema = new mongoose.Schema(
  {
    ticket: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

// TTL Index: MongoDB will delete documents automatically once expiresAt is reached.
OAuthTicketSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("OAuthTicket", OAuthTicketSchema);

