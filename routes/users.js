const express = require("express");
const controller = require("../controllers/users");
const passport = require("passport");

const router = express.Router();

router.param("userId", async (req, res, next, userId) => {
  const foundUser = await controller.fetchUser(userId, next);
  if (foundUser) {
    req.user = foundUser;
    next();
  } else {
    next({
      status: 404,
      message: "User not found",
    });
  }
});

router.post(
  "/signin",
  passport.authenticate("local", { session: false }),
  controller.signin
);

router.post("/signup", controller.signup);

router.put("/:userId", controller.updateUser);

module.exports = router;
