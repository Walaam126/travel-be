const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_SECRET, JWT_EXPIRATION_MS } = require("../config/keys");
const {
  Airline,
  User,
  Booking,
  BookFlight,
  Flight,
  Location,
  Passenger,
} = require("../db/models");

const generateToken = (user, exp) => {
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    isAirline: user.isAirline,
    airlineId: user.airlineId,
    exp: Date.now() + JWT_EXPIRATION_MS,
  };
  if (exp) payload.exp = exp;
  return jwt.sign(JSON.stringify(payload), JWT_SECRET);
};
//----------FETCH A USER----------//
exports.fetchUser = async (userId, next) => {
  try {
    const foundUser = await User.findByPk(userId);
    return foundUser;
  } catch (error) {
    next(error);
  }
};

//----------USER SIGN IN----------//
exports.signin = async (req, res, next) => {
  const { user } = req;
  res.json({ token: generateToken(user) });
};

//----------USER SIGN UP----------//
exports.signup = async (req, res, next) => {
  const { password } = req.body;
  const saltRounds = 10;
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    req.body.password = hashedPassword;
    const newUser = await User.create(req.body);
    res.json({ token: generateToken(newUser) });
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
    res.json({ token: generateToken(updatedUser, req.body.exp) });
  } catch (error) {
    next(error);
  }
};

exports.fetchHistory = async (req, res, next) => {
  try {
    const history = await Booking.findAll({
      order: [["createdAt", "DESC"]],
      where: { userId: req.user.id },
      attributes: { exclude: ["createdAt", "updatedAt", "userId", "type"] },
      include: [
        {
          model: Passenger,
          as: "passengers",
          attributes: { exclude: ["bookingId", "createdAt", "updatedAt"] },
        },
        {
          model: Flight,
          through: BookFlight,
          attributes: {
            exclude: [
              "depAirport",
              "arrAirport",
              "airlineId",
              "economy",
              "business",
              "BookFlight",
              "createdAt",
              "updatedAt",
            ],
          },
          include: [
            {
              model: Airline,
              as: "airline",
              attributes: ["id", "name", "image"],
            },
            {
              model: Location,
              as: "departure",
              attributes: ["id", "name"],
            },
            {
              model: Location,
              as: "arrival",
              attributes: ["id", "name"],
            },
          ],
        },
      ],
    });
    res.json(history);
  } catch (error) {
    next(error);
  }
};
