"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.json")[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.User.hasOne(db.Airline, { as: "airline", foreignKey: "userId" });
db.Airline.belongsTo(db.User, { as: "user" });

db.Airline.hasMany(db.Flight, { foreignKey: "airlineId", as: "flights" });
db.Flight.belongsTo(db.Airline, { foreignKey: "airlineId", as: "airline" });

db.User.hasMany(db.Booking, { foreignKey: "userId", as: "bookings" });
db.Booking.belongsTo(db.User, { foreignKey: "userId", as: "user" });

db.Booking.hasMany(db.Passenger, { foreignKey: "bookingId", as: "passengers" });
db.Passenger.belongsTo(db.Booking, { foreignKey: "bookingId", as: "booking" });

db.Booking.belongsToMany(db.Flight, {
  through: "BookFlight",
  foreignKey: "bookingId",
});

db.Flight.belongsToMany(db.Booking, {
  through: "BookFlight",
  foreignKey: "flightId",
});

db.Location.hasMany(db.Flight, { foreignKey: "depAirport", as: "depflights" });
db.Flight.belongsTo(db.Location, { foreignKey: "depAirport", as: "departure" });

db.Location.hasMany(db.Flight, { foreignKey: "arrAirport", as: "arrflights" });
db.Flight.belongsTo(db.Location, { foreignKey: "arrAirport", as: "arrival" });

module.exports = db;
