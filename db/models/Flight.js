module.exports = (sequelize, DataTypes) =>
  sequelize.define("Flight", {
    departureDate: { type: DataTypes.DATEONLY },
    departureTime: { type: DataTypes.STRING },
    arrivalDate: { type: DataTypes.DATEONLY },
    arrivalTime: { type: DataTypes.STRING },
    economySeats: { type: DataTypes.INTEGER },
    businessSeats: { type: DataTypes.INTEGER },
  });
