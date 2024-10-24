const express = require("express");
const router = express.Router();
const InvestmentService = require("../service/InvestmentService");

router.post("/", async (req, res) => {
  let result = await InvestmentService.getInvestors();
  res.send(result);
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
