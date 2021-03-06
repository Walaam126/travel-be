module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    "Location",
    {
      name: { type: DataTypes.STRING, allowNull: false, unique: true },
    },
    { timestamps: false }
  );
