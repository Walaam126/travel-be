module.exports = (sequelize, DataTypes) =>
  sequelize.define("Location", {
    name: { type: DataTypes.STRING },
  });
