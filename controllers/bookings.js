const { Booking, BookFlight, Flight, Passenger } = require("../db/models");

exports.checkout = async (req, res, next) => {
  try {
    const { user, passengers, goFlight, returnFlight } = req.body;
    const newBooking = await Booking.create({
      userId: user ? user.userId : 0,
      type: returnFlight ? "roundtrip" : "oneway",
    });

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

    const allPassengers = passengers.map((passenger) => ({
      ...passenger,
      bookingId: newBooking.id,
    }));
    const newPassengers = await Passenger.bulkCreate(allPassengers);
    const newBookingItems = await BookFlight.bulkCreate(flights);

    res.status(201).json({ newBooking: newBookingItems, newPassengers });
  } catch (error) {
    next(error);
  }
};
