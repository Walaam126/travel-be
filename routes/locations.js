const express = require("express");
const controller = require("../controllers/locations");

const router = express.Router();

router.get("/", controller.fetchLocations);

module.exports = router;
