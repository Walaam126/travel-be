module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    "Flight",
    {
      depDate: { type: DataTypes.DATEONLY, allowNull: false },
      depTime: { type: DataTypes.STRING, allowNull: false },
      arrDate: { type: DataTypes.DATEONLY, allowNull: false },
      arrTime: { type: DataTypes.STRING, allowNull: false },
      price: { type: DataTypes.INTEGER, allowNull: false },
      economy: { type: DataTypes.INTEGER, allowNull: false },
      business: { type: DataTypes.INTEGER, allowNull: false },
    },
    { timestamps: false }
  );
