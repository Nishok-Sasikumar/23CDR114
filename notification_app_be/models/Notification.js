const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    studentId: {
      type: Number,
      required: true,
    },

    notificationType: {
      type: String,
      enum: ["Event", "Result", "Placement"],
      required: true,
    },

    title: String,

    message: String,

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Notification",
  notificationSchema
);