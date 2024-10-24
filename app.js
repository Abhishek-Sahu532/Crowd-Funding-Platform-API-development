const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");

const InvestmentController = require("./controller/InvestmentController");
const ProjectController = require("./controller/ProjectController");

app.use(bodyParser.urlencoded({ extended: true }));
app.use("/investor", InvestmentController);
app.use("/project", ProjectController);

app.listen(process.env.PORT, () => {
  console.log(
    "Project url: https://" + process.env.PORT + ".sock.hicounselor.com"
  );
});
