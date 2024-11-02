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
  try {
    const { project_id, investor_id, amount } = req.body
    let result = await InvestmentService.makeInvestment({ project_id, investor_id, amount });
    if (!result.success) {
      return res.status(400).json(result)
    }
    return res.status(200).json(result)
  } catch (error) {
    console.log('errrrrrrrrr', error)
    return res.status(500).json({
      success: false,
      message: error?.message
    })
  }
});

router.get("/dashboard/:investorId", async (req, res) => {
  try {
    const {investorId} = req.params
    let result = await InvestmentService.getInvestorDashboard({investorId});

    if (!result.success) {
      return res.status(400).json(result)
    }
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error?.message
    })
  }
});


router.post("/:project_id/feedback", async (req, res) => {
  try {
    const { investorId, rating, comment } = req.body
   const {project_id} = req.params
    let result = await InvestmentService.submitFeedback( { investorId, rating, comment, project_id });
    if (!result.success) {
      return res.status(400).json(result)
    }
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
});

module.exports = router;
