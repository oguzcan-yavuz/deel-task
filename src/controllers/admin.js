const AdminService = require('../services/admin')

const getBestProfession = async (req, res) => {
  const {
    query: { start, end },
  } = req;

  const profession = await AdminService.getBestProfession({ start, end })

  res.json({ bestProfession: profession })
};

const getBestClient = async (req, res) => {
  const {
    query: { start, end, limit },
  } = req;

  const clients = await AdminService.getBestClients({ start, end, limit })


  res.json(clients)
}

module.exports = {
  getBestProfession,
  getBestClient,
}
