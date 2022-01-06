const BalanceService = require('../services/balance')

const depositBalanceForClient = async (req, res) => {
  const {
    params: { userId },
    body: { depositAmount },
  } = req;

  if (!depositAmount) {
    return res.status(400).end()
  }

  try {
    await BalanceService.depositBalanceForClient({ userId, depositAmount });
  } catch (err) {
    res.status(err.status || 500).end()
  }


  res.status(200).end();
}

module.exports = {
  depositBalanceForClient,
}
