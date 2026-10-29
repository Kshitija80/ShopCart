const express = require("express");

const { register, login } = require("../controllers/authController");

const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

// Public owner registration / login
router.post("/register", async (req, res, next) => {
  try {
    await register(req, res);
  } catch (error) {
    next(error);
  }
});

router.post("/login", login);

// Owner can create Staff accounts
router.post("/staff", authenticate, async (req, res, next) => {
  try {
    req.body.role = "STAFF";
    await register(req, res);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
