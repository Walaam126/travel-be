module.exports = (sequelize, DataTypes) =>
  sequelize.define("Passenger", {
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    ageGroup: { type: DataTypes.STRING, allowNull: false },
  });
