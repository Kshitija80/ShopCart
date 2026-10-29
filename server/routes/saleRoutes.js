const express = require("express");

const { getSales, createSale } = require("../controllers/saleController");

const { authenticate } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

// Owner can view sales history
router.get("/", authenticate, authorizeRoles("OWNER"), getSales);

// Owner + Staff can create bills
router.post("/", authenticate, authorizeRoles("OWNER", "STAFF"), createSale);

module.exports = router;
