const { Profile } = require("../model");

const updateBalanceById = ({ id, amount }) => {
  return Profile.increment("balance", {
    by: amount,
    where: { id },
  });
};

module.exports = {
  updateBalanceById,
};
