module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    "User",
    {
      username: { type: DataTypes.STRING, allowNull: false, unique: true },
      password: { type: DataTypes.STRING, allowNull: false },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { isEmail: true },
      },
      firstName: { type: DataTypes.STRING },
      lastName: { type: DataTypes.STRING },
      airlineId: { type: DataTypes.INTEGER, defaultValue: 0 },
    },
    { timestamps: false }
  );
