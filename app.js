const express = require("express");
const cors = require("cors");
const path = require("path");

// Authentication
const passport = require("passport");
const { localStrategy, jwtStrategy } = require("./middleware/passport");

// Data-base
const db = require("./db/models");

// Routes
const userRoutes = require("./routes/users");
const airlineRoutes = require("./routes/airlines");
const flightRoutes = require("./routes/flights");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Passport Middleware
app.use(passport.initialize());
passport.use(localStrategy);
passport.use(jwtStrategy);

// Routes
app.use("/media", express.static(path.join(__dirname, "media")));

app.use(userRoutes);
app.use("/airlines", airlineRoutes);
app.use("/flights", flightRoutes);

app.use((req, res, next) => next({ status: 404, message: "Path not found" }));

app.use((err, req, res, next) =>
  res
    .status(err.status || 500)
    .json({ message: err.message || "Internal Server Error!" })
);

db.sequelize.sync({ alter: true });

app.listen(8000, () => {
  console.log("The application is running on localhost:8000");
});
