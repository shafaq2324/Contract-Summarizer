const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());

app.use(express.json());

app.use("/api/auth", authRoutes);

module.exports = app;

// the following code is to register route
const contractRoutes =
    require("./routes/contractRoutes");

app.use("/api/contracts", contractRoutes);