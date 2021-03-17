const { Location } = require("../db/models");

// FETCH LOCATIONS
exports.fetchLocations = async (req, res, next) => {
  try {
    const locations = await Location.findAll();
    res.json(locations);
  } catch (error) {
    next(error);
  }
};
