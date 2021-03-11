const express = require("express");
const controller = require("../controllers/airlines");
const passport = require("passport");
const upload = require("../middleware/multer");

const router = express.Router();

router.param("airlineId", async (req, res, next, airlineId) => {
  const foundAirline = await controller.fetchAirline(airlineId, next);
  if (foundAirline) {
    req.airline = foundAirline;
    next();
  } else {
    next({
      status: 404,
      message: "Airline not found",
    });
  }
});

router.get("/", controller.fetchAirlines);

router.get(
  "/:airlineId",
  passport.authenticate("jwt", { session: false }),
  controller.fetchAirlineDetails
);

router.get(
  "/:airlineId/flights",
  passport.authenticate("jwt", { session: false }),
  controller.airlineFlights
);

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  upload.single("image"),
  controller.createAirline
);

router.post(
  "/:airlineId/flights",
  passport.authenticate("jwt", { session: false }),
  controller.createFlight
);

module.exports = router;
