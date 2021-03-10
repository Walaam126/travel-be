module.exports = (sequelize, DataTypes) =>
  sequelize.define("User", {
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isEmail: true },
    },
    isAirline: { type: DataTypes.BOOLEAN, defaultValue: false },
  });

// REVIEW: shouldn't the account have a firstname & lastname if it's a normal user?
