const express = require("express");
const router = express.Router();
const InvestmentService = require("../service/InvestmentService");

router.get("/", async (req, res) => {
  try {
    let result = await InvestmentService.getInvestors();
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      message: 'An internal server error occurred'
    });
  }
});

router.post("/investment", async (req, res) => {
  let result = await InvestmentService.makeInvestment();
  res.send(result);
});

router.get("/dashboard", async (req, res) => {
  let result = await InvestmentService.getInvestorDashboard();
  res.send(result);
});
router.post("/:project_id/feedback", async (req, res) => {
  let result = await InvestmentService.submitFeedback();
  res.send(result);
});
module.exports = router;
