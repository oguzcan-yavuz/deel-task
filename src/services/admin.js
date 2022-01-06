const JobRepository = require('../repositories/job')

const getBestProfession = async ({ start, end }) => {
  const [{ dataValues: { profession } }] = await JobRepository.groupJobsByProfessionAndProfit({ start, end, limit: 1 })

  return profession
}

const getBestClients = async ({ start, end, limit = 2 }) => {
  return JobRepository.groupJobsByClientsAndProfit({ start, end, limit })
}

module.exports = {
  getBestProfession,
  getBestClients,
}
