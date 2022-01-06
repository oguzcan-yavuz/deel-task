const ContractRepository = require("../repositories/contract");

const getContract = ({ contractId, profileId }) => {
  return ContractRepository.getContractById({ contractId, profileId });
};

const getContracts = ({ profileId }) => {
  return ContractRepository.getContractsByProfileId({ profileId });
};

module.exports = {
  getContract,
  getContracts,
};
