const { Airline, Flight } = require("../db/models");
const moment = require("moment");

//----------FETCH AN AIRLINE----------//
exports.fetchAirline = async (airlineId, next) => {
  try {
    return await Airline.findByPk(airlineId);
  } catch (error) {
    next(error);
  }
};

//----------FETCH ALL AIRLINES----------//
exports.fetchAirlines = async (req, res, next) => {
  try {
    const airlines = await Airline.findAll({
      attributes: { exclude: ["createdAt", "updatedAt"] },
      include: {
        model: Flight,
        as: "flights",
        attributes: ["id"],
      },
    });
    res.json(airlines);
  } catch (error) {
    next(error);
  }
};

//----------FETCH AIRLINE FLIGHTS----------//
exports.airlineFlights = async (req, res, next) => {
  try {
    const flights = await Flight.findAll({
      where: { airlineId: req.airline.id },
      attributes: { exclude: ["airlineId", "createdAt", "updatedAt"] },
    });
    res.json(flights);
  } catch (error) {
    next(error);
  }
};

//----------CREATE AIRLINE----------//
exports.createAirline = async (req, res, next) => {
  try {
    const foundAirline = await Airline.findOne({
      where: { userId: req.user.id },
    });
    if (foundAirline) {
      const err = new Error("You are already an Airline account");
      err.status = 400;
      next(err);
    }
    if (req.file) {
      req.body.image = `http://${req.get("host")}/media/${req.file.filename}`;
    }
    req.body.userId = req.user.id;
    const newAirline = await Airline.create(req.body);
    res.status(201).json(newAirline);
  } catch (error) {
    next(error);
  }
};

//----------CREATE FLIGHT----------//
exports.createFlight = async (req, res, next) => {
  try {
    if (req.airline.userId !== req.user.id) {
      const err = new Error("You are not the owner, you can't add flights");
      err.status = 401;
      return next(err);
    }

    req.body.airlineId = req.airline.id;

    const flightDep = moment(
      `${req.body.depDate} ${req.body.depTime}`,
      "YYYY-MM-DD H:mm"
    );

    const flightArr = moment(
      `${req.body.arrDate} ${req.body.arrTime}`,
      "YYYY-MM-DD H:mm"
    );

    const duration = Math.abs(flightArr.diff(flightDep, "minutes"));

    const flight = {
      ...req.body,
      depTime: flightArr.add(30, "minutes").format("H:mm"),
      depDate: flightArr.format("YYYY-MM-DD"),
      arrTime: flightArr.add(duration, "minutes").format("H:mm"),
      arrDate: flightArr.format("YYYY-MM-DD"),
      depAirport: req.body.arrAirport,
      arrAirport: req.body.depAirport,
    };

    const flights = await Flight.bulkCreate([req.body, flight]);
    res.status(201).json(flights);
  } catch (error) {
    next(error);
  }
};
