const ContractService = require('../services/contract')

const getContract = async (req, res) => {
  const {
    params: { id },
    profile: { id: profileId },
  } = req;

  const contract = await ContractService.getContract({ contractId: id, profileId })

  if (!contract) return res.status(404).end();

  res.json(contract);
};

const getContracts = async (req, res) => {
  const {
    profile: { id: profileId },
  } = req;

  const contracts = await ContractService.getContracts({ profileId })

  if (!contracts) return res.status(404).end();
  res.json(contracts);
};

module.exports = {
  getContract,
  getContracts,
}
