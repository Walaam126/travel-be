const express = require("express");
const controller = require("../controllers/bookings");

const router = express.Router();

module.exports = router;

router.post("/", controller.createBooking);

module.exports = router;
