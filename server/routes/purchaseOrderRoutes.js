const express = require("express");

const {
  getPurchaseOrders,
  createPurchaseOrder,
  updatePurchaseOrder,
} = require("../controllers/purchaseOrderController");

const { authenticate } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", authenticate, authorizeRoles("OWNER"), getPurchaseOrders);

router.post("/", authenticate, authorizeRoles("OWNER"), createPurchaseOrder);

router.put("/:id", authenticate, authorizeRoles("OWNER"), updatePurchaseOrder);

module.exports = router;
