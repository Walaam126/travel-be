const express = require("express");
const cors = require("cors");

// Data-base
const db = require("./db/models");

// Authentication
const passport = require("passport");
const { localStrategy } = require("./middleware/passport");

// Routes
const userRoutes = require("./routes/users");

const app = express();

app.use(cors());
app.use(express.json());
app.use(passport.initialize());
passport.use(localStrategy);

app.use(userRoutes);

app.use((req, res, next) => next({ status: 404, message: "Path not found" }));

app.use((err, req, res, next) =>
  res
    .status(err.status ?? 500)
    .json({ message: err.message ?? "Internal Server Error!" })
);

db.sequelize.sync({ alter: true });

app.listen(8000, () => {
  console.log("The application is running on localhost:8000");
});
