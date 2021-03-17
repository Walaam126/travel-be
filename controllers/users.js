const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_SECRET, JWT_EXPIRATION_MS } = require("../config/keys");
const model = require("../db/models");

// GENERATE TOKEN
const generateToken = (user, exp) => {
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    airlineId: user.airlineId,
    exp: Date.now() + JWT_EXPIRATION_MS,
  };
  if (exp) payload.exp = exp;
  return jwt.sign(JSON.stringify(payload), JWT_SECRET);
};

// SIGN IN
exports.signin = async (req, res, next) =>
  res.json({ token: generateToken(req.user) });

// SIGN UP
exports.signup = async (req, res, next) => {
  const { password } = req.body;
  const saltRounds = 10;
  try {
    req.body.password = await bcrypt.hash(password, saltRounds);
    const newUser = await model.User.create(req.body);
    res.json({ token: generateToken(newUser) });
  } catch (error) {
    next(error);
  }
};

// UPDATE INFO
exports.updateUser = async (req, res, next) => {
  try {
    if (req.user.id !== req.body.id) {
      const err = new Error("You can not update another user info");
      err.status = 401;
      return next(err);
    }

    const updatedUser = await req.user.update(req.body);
    res.json({ token: generateToken(updatedUser, req.body.exp) });
  } catch (error) {
    next(error);
  }
};

// FETCH BOOKINGS HISTORY
exports.fetchHistory = async (req, res, next) => {
  try {
    const history = await model.Booking.findAll({
      order: [["createdAt", "DESC"]],
      where: { userId: req.user.id },
      attributes: { exclude: ["userId", "createdAt", "updatedAt"] },
      include: [
        {
          model: model.Passenger,
          as: "passengers",
          attributes: { exclude: ["bookingId"] },
        },
        {
          model: model.Flight,
          through: model.BookFlight,
          attributes: {
            exclude: [
              "airlineId",
              "arrAirport",
              "BookFlights",
              "depAirport",
              "economy",
              "business",
            ],
          },
          include: [
            {
              model: model.Airline,
              as: "airline",
              attributes: { exclude: ["slug", "userId"] },
            },
            { model: model.Location, as: "departure" },
            { model: model.Location, as: "arrival" },
          ],
        },
      ],
    });
    res.json(history);
  } catch (error) {
    next(error);
  }
};
