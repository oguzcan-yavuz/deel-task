const JobRepository = require("../repositories/job");
const ProfileRepository = require("../repositories/profile");

const calculateTotalJobPrice = ({ jobs }) =>
  jobs.reduce((amount, job) => amount + job.price, 0);

const isDepositAmountValid = ({ depositAmount, amountToPay }) => {
  const quarterOfAmountToPay = amountToPay / 4;

  return depositAmount < quarterOfAmountToPay;
};

const depositBalanceForClient = async ({ userId, depositAmount }) => {
  const jobs = await JobRepository.getUnpaidJobsByClientId({
    clientId: userId,
  });

  const totalAmountToPay = calculateTotalJobPrice({ jobs });

  if (!isDepositAmountValid({ depositAmount, amountToPay: totalAmountToPay })) {
    const error = new Error();
    error.status = 409;
    throw error;
  }

  await ProfileRepository.updateBalanceById({
    id: userId,
    amount: depositAmount,
  });
};

module.exports = {
  calculateTotalJobPrice,
  isDepositAmountValid,
  depositBalanceForClient,
};
