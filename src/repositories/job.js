const {Op} = require('sequelize')
const { Job, Contract, Profile, sequelize } = require('../model')

const getUnpaidJobsByProfileId = ({ profileId }) => {
  return Job.findAll({
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
}

const getUnpaidJobsByClientId = ({ clientId }) => {
  return Job.findAll({
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
          ClientId: clientId,
        },
      },
    ],
  });
}

const getUnpaidJobByJobIdAndClientId = ({ jobId, clientId }) => {
  return Job.findOne({
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
          ClientId: clientId,
        },
      },
    ],
  });
}

const payForJobTransactional = ({ job, profile }) => {
  return sequelize.transaction(async (transaction) => {
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
          id: job.id,
        },
        transaction,
      }
    );
  });
}

const groupJobsByProfessionAndProfit = ({ start, end, limit }) => {
  return Job.findAll({
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
    limit
  });
}

const groupJobsByClientsAndProfit = ({ start, end, limit }) => {
  return Job.findAll({
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
}

module.exports = {
  getUnpaidJobsByProfileId,
  getUnpaidJobByJobIdAndClientId,
  getUnpaidJobsByClientId,
  payForJobTransactional,
  groupJobsByProfessionAndProfit,
  groupJobsByClientsAndProfit,
}
