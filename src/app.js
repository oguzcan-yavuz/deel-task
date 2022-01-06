const express = require("express");
const bodyParser = require("body-parser");
const { Op } = require("sequelize");
const { sequelize } = require("./model");
const { getProfile } = require("./middleware/getProfile");
const app = express();
app.use(bodyParser.json());
app.set("sequelize", sequelize);
app.set("models", sequelize.models);

/**
 * @returns contract by id
 */
app.get("/contracts/:id", getProfile, async (req, res) => {
  const { Contract } = req.app.get("models");
  const {
    params: { id },
    profile: { id: profileId },
  } = req;

  const contract = await Contract.findOne({
    where: {
      id,
      [Op.or]: [{ ContractorId: profileId }, { ClientId: profileId }],
    },
  });
  if (!contract) return res.status(404).end();
  res.json(contract);
});

/**
 * @returns non terminated contracts of the user
 */
app.get("/contracts", getProfile, async (req, res) => {
  const { Contract } = req.app.get("models");
  const {
    profile: { id: profileId },
  } = req;

  const contracts = await Contract.findAll({
    where: {
      [Op.not]: [{ status: 'terminated' }],
      [Op.or]: [{ ContractorId: profileId }, { ClientId: profileId }],
    },
  });
  if (!contracts) return res.status(404).end();
  res.json(contracts);
});

/**
 * @returns unpaid jobs for active contracts of the user
 */
app.get("/jobs/unpaid", getProfile, async (req, res) => {
  const { Job, Contract } = req.app.get("models");
  const {
    profile: { id: profileId },
  } = req;

  const jobs = await Job.findAll({
    where: {
      paid: {
        [Op.or]: [false, null]
      },
    },
    include: [{
      model: Contract,
      where: {
        [Op.not]: [{ status: 'terminated' }],
        [Op.or]: [{ ContractorId: profileId }, { ClientId: profileId }],
      }
    }]
  });
  if (!jobs) return res.status(404).end();
  res.json(jobs);
});

module.exports = app;
