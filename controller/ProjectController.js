const express = require("express");
const router = express.Router();
const ProjectService = require("../service/ProjectService");

router.post("/", async (req, res) => {
  let result = await ProjectService.createProject();
  res.send(result);
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
