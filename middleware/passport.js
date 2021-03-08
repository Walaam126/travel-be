const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const { User } = require("../db/models");

exports.localStrategy = new LocalStrategy(async (username, password, done) => {
  try {
    const user = await User.findOne({ where: { username } });
    let pwdMatch = user ? await bcrypt.compare(password, user.password) : false;
    if (pwdMatch) return done(null, user);
    else return done(null, false);
  } catch (error) {
    return done(error);
  }
});
