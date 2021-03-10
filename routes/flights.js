const express = require("express");
const controller = require("../controllers/flights");

const router = express.Router();

router.param("flightId", async (req, res, next, flightId) => {
  const foundFlight = await controller.fetchFlight(flightId, next);
  if (foundFlight) {
    req.flight = foundFlight;
    next();
  } else {
    next({
      status: 404,
      message: "Flight not found",
    });
  }
});

router.get("/", controller.fetchFlights);

module.exports = router;
