const JobRepository = require('../repositories/job')

const getUnpaidJobs = ({ profileId }) => {
  return JobRepository.getUnpaidJobsByProfileId({ profileId })
}

const isJobValid = ({ job }) => {
  return job && job.Contract
}

const isBalanceEnough = ({ profile, job }) => {
  return profile.balance >= job.price
}

const payForJob = async ({ jobId, profile }) => {
  const job = await JobRepository.getUnpaidJobByJobIdAndClientId({ jobId, clientId: profile.id })

  if (!isJobValid({ job })) {
    // TODO: these would be errors that encapsulate business logic like NotFoundError or InsufficientBalanceError
    // an error structure and error handling middleware is required for handling these in better way. service layer shouldn't be responsible
    // for setting up http status code.
    const error = new Error()
    error.status = 404
    throw error;
  }

  // client has not enough balance
  if (!isBalanceEnough({ profile, job })) {
    const error = new Error()
    error.status = 409
    throw error;
  }

  return JobRepository.payForJobTransactional({ job, profile })
}

module.exports = {
  getUnpaidJobs,
  payForJob,
}
