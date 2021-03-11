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
        exclude: ["depAirport", "arrAirport", "createdAt", "updatedAt"],
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

//----------UPDATE FLIGHT----------//
exports.updateFlight = async (req, res, next) => {
  try {
    const foundAirline = await Airline.findByPk(req.flight.airlineId);
    if (!foundAirline) {
      const err = new Error("Create an Airline first!");
      err.status = 401;
      next(err);
    }

    if (foundAirline.userId !== req.user.id) {
      const err = new Error(
        "You are not the owner, you can't update this airline flights."
      );
      err.status = 401;
      next(err);
    }

    const updatedFlight = await req.flight.update(req.body);
    res.status(201).json(updatedFlight);
  } catch (error) {
    next(error);
  }
};
