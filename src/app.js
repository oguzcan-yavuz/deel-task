const express = require("express");
const bodyParser = require("body-parser");
const { Op } = require("sequelize");
const { sequelize } = require("./model");
const { getProfile } = require("./middleware/getProfile");
const app = express();
const routers = require('./routers')
app.use(bodyParser.json());
app.set("sequelize", sequelize);
app.set("models", sequelize.models);
app.use(routers)

/**
 * Deposits money into the clients balance
 */
app.post("/balances/deposit/:userId", async (req, res) => {
  const { Job, Profile, Contract } = req.app.get("models");
  const {
    params: { userId },
    body: { depositAmount },
  } = req;

  if (!depositAmount) {
    return res.status(400).end()
  }

  const jobs = await Job.findAll({
    where: {
      paid: {
        [Op.or]: [false, null],
      },
    },
    include: [
      {
        model: Contract,
        where: {
          [Op.not]: [{ status: "terminated" }],
          ClientId: userId,
        },
      },
    ],
  });

  const totalAmountToPay = jobs.reduce((amount, job) => amount + job.price, 0);
  const quarterOfTotalAmountToPay = totalAmountToPay / 4;

  if (depositAmount > quarterOfTotalAmountToPay) {
    return res.status(409).end();
  }

  // update the balances
  await Profile.increment("balance", {
    by: depositAmount,
    where: { id: userId },
  });

  res.status(200).end();
});

/**
 * @returns Returns the profession that earned the most money (sum of jobs paid) for any contactor that worked in the query time range.
 */
app.get("/admin/best-profession", async (req, res) => {
  const { Job, Contract, Profile } = req.app.get("models");
  const {
    query: { start, end },
  } = req;

  const [{ dataValues: { profession } }] = await Job.findAll({
    where: {
      paid: true,
      createdAt: {
        [Op.between]: [start, end]
      }
    },
    include: [
      {
        model: Contract,
        include: [
          {
            model: Profile,
            as: 'Contractor'
          }
        ]
      },
    ],
    group: '`Contract->Contractor`.`profession`',
    attributes: [
      [sequelize.fn('SUM', sequelize.col('price')), 'paid'],
      [sequelize.col('`Contract->Contractor`.`profession`'), 'profession'],
    ],
    order: [sequelize.literal('paid DESC')],
    limit: 1
  });

  res.json({ bestProfession: profession })
});

/**
 * @returns the clients the paid the most for jobs in the query time period. limit query parameter should be applied, default limit is 2.
 */
app.get("/admin/best-client", async (req, res) => {
  const { Job, Contract, Profile } = req.app.get("models");
  const {
    query: { start, end, limit = 2 },
  } = req;

  const clients = await Job.findAll({
    where: {
      paid: true,
      createdAt: {
        [Op.between]: [start, end]
      }
    },
    include: [
      {
        model: Contract,
        attributes: [],
        include: [
          {
            model: Profile,
            as: 'Client',
            attributes: []
          }
        ],
      },
    ],
    group: '`Contract->Client`.`id`',
    attributes: [
      [sequelize.fn('SUM', sequelize.col('price')), 'paid'],
      [sequelize.col('`Contract->Client`.`id`'), 'id'],
      [sequelize.literal("`Contract->Client`.`firstName` || ' ' || `Contract->Client`.`lastName`"), 'fullName']
    ],
    order: [sequelize.literal('paid DESC')],
    limit
  });

  res.json(clients)
});

module.exports = app;
