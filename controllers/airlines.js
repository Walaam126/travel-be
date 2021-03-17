const moment = require("moment");
const { Airline, Flight, Location } = require("../db/models");
const userController = require("../controllers/users");

// FETCH AIRLINE
exports.fetchAirline = async (airlineId, next) => {
  try {
    return await Airline.findByPk(airlineId);
  } catch (error) {
    next(error);
  }
};

// FETCH AIRLINE DETAILS
exports.fetchAirlineDetails = async (req, res, next) => {
  if (req.user.id !== req.airline.userId) {
    const err = new Error("You are not the owner of this Airline");
    err.status = 401;
    return next(err);
  }

  res.json(req.airline);
};

// FETCH AIRLINE FLIGHTS
exports.airlineFlights = async (req, res, next) => {
  try {
    if (req.user.id !== req.airline.userId) {
      const err = new Error("You are not the owner of this Airline");
      err.status = 401;
      return next(err);
    }

    const flights = await Flight.findAll({
      order: [["depDate", "DESC"]],
      where: { airlineId: req.airline.id },
      attributes: { exclude: ["arrAirport", "depAirport"] },
      include: [
        { model: Location, as: "departure" },
        { model: Location, as: "arrival" },
      ],
    });
    res.json(flights);
  } catch (error) {
    next(error);
  }
};

// CREATE AIRLINE
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
      req.body.logo = `http://${req.get("host")}/media/${req.file.filename}`;
    }

    req.body.userId = req.user.id;
    const newAirline = await Airline.create(req.body);
    await req.user.update({ airlineId: newAirline.id });
    res.status(201).json(newAirline);
  } catch (error) {
    next(error);
  }
};

// CREATE FLIGHT
exports.createFlight = async (req, res, next) => {
  try {
    if (req.airline.userId !== req.user.id) {
      const err = new Error("You are not the owner, you can't add flights");
      err.status = 401;
      return next(err);
    }

    const duration = req.body.duration;
    delete req.body.duration;

    const flightDep = moment(
      `${req.body.depDate} ${req.body.depTime}`,
      "YYYY-MM-DD H:mm"
    );
    const flightArr = flightDep;
    flightArr.add(duration, "minutes");

    req.body.arrDate = flightArr.format("YYYY-MM-DD");
    req.body.arrTime = flightArr.format("H:mm");
    req.body.airlineId = req.airline.id;

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
