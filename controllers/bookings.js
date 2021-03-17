const { Booking, BookFlight, Flight, Passenger } = require("../db/models");

// CREATE BOOKING
exports.createBooking = async (req, res, next) => {
  try {
    const { user, passengers, goFlight, returnFlight } = req.body;
    const newBooking = await Booking.create({
      userId: user ? user.userId : 0,
      type: returnFlight ? "roundtrip" : "oneway",
      totalPrice: returnFlight
        ? (goFlight.price + returnFlight.price) * passengers.length
        : goFlight.price * passengers.length,
    });

    const allPassengers = passengers.map((passenger) => ({
      ...passenger,
      bookingId: newBooking.id,
    }));
    const newPassengers = await Passenger.bulkCreate(allPassengers);

    goFlight.bookingId = newBooking.id;
    await Flight.decrement(goFlight.seat, {
      by: passengers.length,
      where: { id: goFlight.flightId },
    });
    const flights = [goFlight];

    if (returnFlight) {
      returnFlight.bookingId = newBooking.id;
      await Flight.decrement(goFlight.seat, {
        by: passengers.length,
        where: { id: returnFlight.flightId },
      });
      flights.push(returnFlight);
    }
    const newBookingItems = await BookFlight.bulkCreate(flights);

    res.status(201).json({ newBooking, items: newBookingItems, newPassengers });
  } catch (error) {
    next(error);
  }
};
