module.exports = (sequelize, DataTypes) =>
  sequelize.define("Booking", {
    type: { type: DataTypes.STRING, allowNull: false },
  });
