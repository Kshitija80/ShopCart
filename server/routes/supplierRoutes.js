const express = require("express");

const {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} = require("../controllers/supplierController");

const { authenticate } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

// Owner only
router.get("/", authenticate, authorizeRoles("OWNER"), getSuppliers);

router.post("/", authenticate, authorizeRoles("OWNER"), createSupplier);

router.put("/:id", authenticate, authorizeRoles("OWNER"), updateSupplier);

router.delete("/:id", authenticate, authorizeRoles("OWNER"), deleteSupplier);

module.exports = router;
