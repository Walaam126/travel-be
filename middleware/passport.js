const bcrypt = require("bcrypt");

// Passport Strategies
const LocalStrategy = require("passport-local").Strategy;
const JWTStrategy = require("passport-jwt").Strategy;
const { fromAuthHeaderAsBearerToken } = require("passport-jwt").ExtractJwt;

// Models
const { User } = require("../db/models");

// JWT Secret Key
const { JWT_SECRET } = require("../config/keys");

exports.jwtStrategy = new JWTStrategy(
  {
    jwtFromRequest: fromAuthHeaderAsBearerToken(),
    secretOrKey: JWT_SECRET,
  },
  async (jwtPayload, done) => {
    if (Date.now() > jwtPayload.exp) {
      return done(null, false);
    }
    try {
      const user = await User.findByPk(jwtPayload.id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  }
);

exports.localStrategy = new LocalStrategy(async (username, password, done) => {
  try {
    const user = await User.findOne({ where: { username } });
    let pwdMatch = user ? await bcrypt.compare(password, user.password) : false;
    if (pwdMatch) return done(null, user);
    return done(null, false);
  } catch (error) {
    return done(error);
  }
});
