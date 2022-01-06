const JobService = require('../services/job')

const getUnpaidJobs = async (req, res) => {
  const {
    profile: { id: profileId },
  } = req;

  const jobs = await JobService.getUnpaidJobs({ profileId })

  if (!jobs) return res.status(404).end();

  res.json(jobs);
};

const payForJob = async (req, res) => {
  const {
    params: { job_id: jobId },
    profile,
  } = req;

  try {
    await JobService.payForJob({ jobId, profile })
  } catch (err) {
    res.status(err.status || 500).end()
  }

  res.status(200).end();
};

module.exports = {
  getUnpaidJobs,
  payForJob,
}
