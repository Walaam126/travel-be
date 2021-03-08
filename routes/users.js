const express = require("express");
const controller = require("../controllers/users");
const passport = require("passport");

const router = express.Router();

router.post(
  "/signin",
  passport.authenticate("local", { session: false }),
  controller.signin
);

router.post("/signup", controller.signup);

module.exports = router;
