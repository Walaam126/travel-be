const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_SECRET, JWT_EXPIRATION_MS } = require("../config/keys");
const { User } = require("../db/models");

//----------FETCH A USER----------//
exports.fetchUser = async (userId, next) => {
  try {
    const foundUser = await User.findByPk(userId);
    return foundUser;
  } catch (error) {
    next(error);
  }
};

// Create a function that will handle the generation of the payload and token for you
//----------USER SIGN IN----------//
exports.signin = async (req, res, next) => {
  const { user } = req;
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    isAirline: user.isAirline,
    airlineId: user.airlineId,
    exp: Date.now() + JWT_EXPIRATION_MS,
  };
  const token = jwt.sign(JSON.stringify(payload), JWT_SECRET);
  res.json({ token });
};

//----------USER SIGN UP----------//
exports.signup = async (req, res, next) => {
  const { password } = req.body;
  const saltRounds = 10;
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    req.body.password = hashedPassword;
    const newUser = await User.create(req.body);
    const payload = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      isAirline: newUser.isAirline,
      airlineId: newUser.airlineId,
      exp: Date.now() + JWT_EXPIRATION_MS,
    };
    const token = jwt.sign(JSON.stringify(payload), JWT_SECRET);
    res.json({ token });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    if (req.user.id !== req.body.id) {
      const err = new Error("You can't update another user info!");
      err.status = 401;
      return next(err);
    }

    const updatedUser = await req.user.update(req.body);
    const payload = {
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      isAirline: updatedUser.isAirline,
      airlineId: updatedUser.airlineId,
      exp: req.body.exp,
    };

    const token = jwt.sign(JSON.stringify(payload), JWT_SECRET);
    res.json({ token });
  } catch (error) {
    next(error);
  }
};
