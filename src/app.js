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
      [Op.not]: [{ status: "terminated" }],
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
        [Op.or]: [false, null],
      },
    },
    include: [
      {
        model: Contract,
        where: {
          [Op.not]: [{ status: "terminated" }],
          [Op.or]: [{ ContractorId: profileId }, { ClientId: profileId }],
        },
      },
    ],
  });
  if (!jobs) return res.status(404).end();
  res.json(jobs);
});

/**
 * Pays for a job from client to contractor
 */
app.post("/jobs/:job_id/pay", getProfile, async (req, res) => {
  const { Job, Profile, Contract } = req.app.get("models");
  const {
    params: { job_id: jobId },
    profile,
  } = req;

  const job = await Job.findOne({
    where: {
      id: jobId,
      paid: {
        [Op.or]: [false, null],
      },
    },
    include: [
      {
        model: Contract,
        where: {
          [Op.not]: [{ status: "terminated" }],
          ClientId: profile.id,
        },
      },
    ],
  });

  if (!job || !job.Contract) return res.status(404).end();

  // client has not enough balance
  if (profile.balance < job.price) {
    return res.status(409).end();
  }

  const result = await sequelize.transaction(async (transaction) => {
    // update the balances
    await Profile.increment("balance", {
      by: job.price,
      where: { id: job.Contract.ContractorId },
      transaction,
    });
    await Profile.decrement("balance", {
      by: job.price,
      where: { id: profile.id },
      transaction,
    });

    // mark the job as paid
    await Job.update(
      { paid: true, paymentDate: new Date() },
      {
        where: {
          id: jobId,
        },
        transaction,
      }
    );
  });

  if (!result) return res.status(404).end();

  res.status(200).end();
});

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

  const jobs = await Job.findAll({
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
  });

  const professionsWithBalances = jobs.reduce((professions, job) => {
    professions[job.Contract.Contractor.profession] = professions[job.Contract.Contractor.profession] ?? 0
    professions[job.Contract.Contractor.profession] += job.price

    return professions
  }, {})

  const bestProfession = Object.keys(professionsWithBalances).reduce((a, b) => professionsWithBalances[a] > professionsWithBalances[b] ? a : b)

  res.json({ bestProfession })
});

module.exports = app;
