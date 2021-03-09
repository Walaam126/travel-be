module.exports = (sequelize, DataTypes) =>
  sequelize.define("Airline", {
    name: { type: DataTypes.STRING },
  });
