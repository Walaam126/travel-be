const { Airline, Flight } = require("../db/models");

const moment = require("moment");

exports.fetchAirline = async (airlineId, next) => {
  try {
    return await Airline.findByPk(airlineId);
  } catch (error) {
    next(error);
  }
};

exports.listAirlines = async (req, res, next) => {
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
    const newFlight = await Flight.create(req.body);

    const duration = moment(newFlight.arrTime, "HH:mm").diff(
      moment(newFlight.depTime, "HH:mm"),
      "minutes"
    );

    const backFlight = {
      depTime: moment(newFlight.arrTime, "HH:mm")
        .add(30, "minutes")
        .format("HH:mm"),
      arrTime: moment(newFlight.arrTime, "HH:mm")
        .add(duration + 30, "minutes")
        .format("HH:mm"),
      depAirport: newFlight.arrAirport,
      arrAirport: newFlight.depAirport,
      price: newFlight.price,
      economy: newFlight.economy,
      business: newFlight.business,
      airlineId: req.airline.id,
    };

    if (moment(newFlight.arrTime, "HH:mm") >= moment("23:30", "HH:mm")) {
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

    const otherFlight = await Flight.create(backFlight);
    res.status(201).json([newFlight, backFlight]);
  } catch (error) {
    next(error);
  }
};
