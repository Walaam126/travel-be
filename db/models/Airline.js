const SequelizeSlugify = require("sequelize-slugify");

module.exports = (sequelize, DataTypes) => {
  const Airline = sequelize.define("Airline", {
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    slug: { type: DataTypes.STRING, unique: true },
    image: { type: DataTypes.STRING }, // must be allowNull : false
  });

  SequelizeSlugify.slugifyModel(Airline, {
    source: ["name"],
  });

  return Airline;
};
