const {getProfile} = require('../middleware/getProfile')
const {getContract, getContracts} = require('../controllers/contract')
const {getUnpaidJobs, payForJob} = require('../controllers/job')
const {depositBalanceForClient} = require('../controllers/balance')
const {getBestProfession, getBestClient} = require('../controllers/admin')
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

/**
 * @returns Returns the profession that earned the most money (sum of jobs paid) for any contactor that worked in the query time range.
 */
router.get("/admin/best-profession", getBestProfession);


/**
 * @returns the clients the paid the most for jobs in the query time period. limit query parameter should be applied, default limit is 2.
 */
router.get("/admin/best-client", getBestClient);

module.exports = router
