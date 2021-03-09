module.exports = (sequelize, DataTypes) =>
  sequelize.define("Passenger", {
    name: { type: DataTypes.STRING },
    cpr: { type: DataTypes.STRING },
  });
