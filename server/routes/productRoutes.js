const express = require("express");

const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const { authenticate } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

// Owner + Staff can view inventory
router.get("/", authenticate, getProducts);

router.get("/:id", authenticate, getProductById);

// Owner only can modify inventory
router.post("/", authenticate, authorizeRoles("OWNER"), createProduct);

router.put("/:id", authenticate, authorizeRoles("OWNER"), updateProduct);

router.delete("/:id", authenticate, authorizeRoles("OWNER"), deleteProduct);

module.exports = router;
