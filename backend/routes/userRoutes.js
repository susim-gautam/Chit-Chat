const express = require("express");
const {
  registerUser,
  authUser,
  allUsers,
} = require("../controllers/userControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();
// router.route("/").get(protect, allUsers).post(registerUser);
router.route("/").get(protect, allUsers).post(registerUser);
router.post("/login", authUser);
// console.log("susikg");

module.exports = router;
