const { Airline, Flight, Location } = require("../db/models");

//----------FETCH AN FLIGHT----------//
exports.fetchFlight = async (flightId, next) => {
  try {
    return await Flight.findByPk(flightId);
  } catch (error) {
    next(error);
  }
};

//----------FETCH ALL FLIGHTS----------//
exports.fetchFlights = async (req, res, next) => {
  try {
    const flights = await Flight.findAll({
      attributes: {
        exclude: [
          "depAirport",
          "arrAirport",
          "airlineId",
          "createdAt",
          "updatedAt",
        ],
      },
      include: [
        {
          model: Airline,
          as: "airline",
          attributes: ["id", "name", "image"],
        },
        {
          model: Location,
          as: "departure",
          attributes: ["id", "name"],
        },
        {
          model: Location,
          as: "arrival",
          attributes: ["id", "name"],
        },
      ],
    });
    res.json(flights);
  } catch (error) {
    next(error);
  }
};
