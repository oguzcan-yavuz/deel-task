const { Op } = require("sequelize");
const { Contract } = require("../model");

const getContractById = async ({ contractId, profileId }) => {
  const contract = await Contract.findOne({
    where: {
      id: contractId,
      [Op.or]: [{ ContractorId: profileId }, { ClientId: profileId }],
    },
  });

  return contract;
};

const getContractsByProfileId = async ({ profileId }) => {
  const contracts = await Contract.findAll({
    where: {
      [Op.not]: [{ status: "terminated" }],
      [Op.or]: [{ ContractorId: profileId }, { ClientId: profileId }],
    },
  });

  return contracts;
};

module.exports = { getContractById, getContractsByProfileId };
