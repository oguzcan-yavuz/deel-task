const express = require("express");
const bodyParser = require("body-parser");
const { sequelize } = require("./model");
const app = express();
const routers = require('./routers')
app.use(bodyParser.json());
app.set("sequelize", sequelize);
app.set("models", sequelize.models);
app.use(routers)

module.exports = app;
