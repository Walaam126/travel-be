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

router.put(
  "/",
  passport.authenticate("jwt", { session: false }),
  controller.updateUser
);

module.exports = router;
