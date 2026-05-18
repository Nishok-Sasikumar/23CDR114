const express = require("express");

const router = express.Router();

const Notification = require("../models/Notification");

router.post("/", async (req, res) => {
  try {
    const notification = await Notification.create(
      req.body
    );

    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

router.get("/:studentId", async (req, res) => {
  try {
    const notifications = await Notification.find({
      studentId: req.params.studentId,
    }).sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;