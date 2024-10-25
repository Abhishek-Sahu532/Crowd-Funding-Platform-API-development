const express = require("express");
const router = express.Router();
const ProjectService = require("../service/ProjectService");

router.post("/", async (req, res) => {
  const { title, description, category, fundingGoal, currentFunding } = req.body
  let result = await ProjectService.createProject({ title, description, category, fundingGoal, currentFunding });

  if (!result.success) {
    return res.status(400).json(result)
  }
 return res.status(200).json(result)
});


router.get("/", async (req, res) => {
  let result = await ProjectService.getAllProjects();
  res.send(result);
});
router.get("/:category", async (req, res) => {
  let result = await ProjectService.getProjectsByCategory();
  res.send(result);
});
router.get("/:project_id", async (req, res) => {
  let result = await ProjectService.getProjectDetails();
  res.send(result);
});
router.get("/:project_id/investments", async (req, res) => {
  let result = await ProjectService.getInvestmentDetailsByProjectId();
  res.send(result);
});
module.exports = router;
