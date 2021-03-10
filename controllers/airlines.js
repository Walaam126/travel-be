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
      attributes: { exclude: ["userId", "createdAt", "updatedAt"] },
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
    const foundAirline = await Airline.findByPk(req.airline.id);
    if (!foundAirline) {
      const err = new Error("Create an Airline first!");
      err.status = 401;
      next(err);
    }
    if (foundAirline.userId !== req.user.id) {
      const err = new Error("You are not the owner, you can't add flights.");
      err.status = 401;
      next(err);
    }

    req.body.airlineId = req.airline.id;
    const newFlight = req.body;

    const newdepTime = moment(newFlight.depTime, "HH:mm");
    const newarrTime = moment(newFlight.arrTime, "HH:mm");

    const duration = newarrTime.diff(newdepTime, "minutes");

    let backFlight = Object.assign({}, req.body);
    backFlight = {
      ...backFlight,
      depTime: newarrTime.add(30, "minutes").format("HH:mm"),
      arrTime: newarrTime.add(duration + 30, "minutes").format("HH:mm"),
      depAirport: newFlight.arrAirport,
      arrAirport: newFlight.depAirport,
    };

    //---Assign Arrival Flight Dates---//
    if (newarrTime >= moment("23:30", "HH:mm")) {
      backFlight.depDate = moment(newFlight.arrDate)
        .add(1, "days")
        .format("YYYY-MM-DD");
      backFlight.arrDate = backFlight.depDate;
    } else if (
      moment(backFlight.arrTime, "HH:mm") >= moment("00:00", "HH:mm")
    ) {
      backFlight.depDate = newFlight.arrDate;
      backFlight.arrDate = moment(backFlight.depDate)
        .add(1, "days")
        .format("YYYY-MM-DD");
    } else {
      backFlight.depDate = newFlight.arrDate;
      backFlight.arrDate = backFlight.depDate;
    }

    const flights = await Flight.bulkCreate([req.body, backFlight]);
    res.status(201).json(flights);
  } catch (error) {
    next(error);
  }
};
