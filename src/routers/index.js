const {getProfile} = require('../middleware/getProfile')
const {getContract, getContracts} = require('../controllers/contract')
const router = require('express').Router();

/**
 * @returns contract by id
 */
router.get("/contracts/:id", getProfile, getContract);

/**
 * @returns non terminated contracts of the user
 */
router.get("/contracts", getProfile, getContracts);

module.exports = router
