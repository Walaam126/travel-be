const express = require("express");
const controller = require("../controllers/bookings");

const router = express.Router();

module.exports = router;

router.post("/checkout", controller.checkout);

module.exports = router;
