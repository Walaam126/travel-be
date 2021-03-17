const express = require("express");
const passport = require("passport");
const controller = require("../controllers/users");

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

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  controller.fetchHistory
);

module.exports = router;
