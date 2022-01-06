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

module.exports = {
  getUnpaidJobsByProfileId,
  getUnpaidJobByJobIdAndClientId,
  payForJobTransactional,
}
