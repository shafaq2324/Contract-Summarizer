const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const contractRoutes = require("./routes/contractRoutes");


const app = express();

app.use(cors());

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/contracts", contractRoutes);

module.exports = app;