const express = require("express");

const {
  getDashboard,
  getProfitLoss,
} = require("../controllers/reportController");

const { authenticate } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

// Owner only
router.get("/dashboard", authenticate, authorizeRoles("OWNER"), getDashboard);

router.get(
  "/profit-loss",
  authenticate,
  authorizeRoles("OWNER"),
  getProfitLoss,
);

module.exports = router;
