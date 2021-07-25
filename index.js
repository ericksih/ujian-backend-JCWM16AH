const express = require("express");
const app = express();
const cors = require("cors");
const bearerToken = require("express-bearer-token");
const { authRouter, movieRouter } = require("./router");
const { db } = require("./config/database");

// apply middleware
app.use(cors());
app.use(express.json());
app.use(bearerToken());
app.use("/user", authRouter);
app.use("/movies", movieRouter);

// main route
const response = (req, res) =>
  res.status(200).send("<h1>REST API JCWM16AH</h1>");
app.get("/", response);

db.getConnection((error, connection) => {
  if (error) {
    return console.error("MySql Error: ", error.message);
  }
  console.log(`Connect MySql Server : ${connection.threadId}`);
});

// Error handling
app.use((error, req, res, next) => {
  console.log("Error", error);
  res.status(500).send({ status: "SQL Error :", messages: error });
});

// bind to local machine
const PORT = process.env.PORT || 2000;
app.listen(PORT, () => `CONNECTED : port ${PORT}`);
