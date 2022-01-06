const {getProfile} = require('../middleware/getProfile')
const {getContract, getContracts} = require('../controllers/contract')
const {getUnpaidJobs, payForJob} = require('../controllers/job')
const {depositBalanceForClient} = require('../controllers/balance')
const router = require('express').Router();

/**
 * @returns contract by id
 */
router.get("/contracts/:id", getProfile, getContract);

/**
 * @returns non terminated contracts of the user
 */
router.get("/contracts", getProfile, getContracts);

/**
 * @returns unpaid jobs for active contracts of the user
 */
router.get("/jobs/unpaid", getProfile, getUnpaidJobs);

/**
 * Pays for a job from client to contractor
 */
router.post("/jobs/:job_id/pay", getProfile, payForJob);

/**
 * Deposits money into the clients balance
 */
router.post("/balances/deposit/:userId", depositBalanceForClient);

module.exports = router
