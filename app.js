const express = require("express");
const app = express();

dotenv.path('./env')

const InvestmentController = require("./controller/InvestmentController");
const ProjectController = require("./controller/ProjectController");


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/investor", InvestmentController);
app.use("/project", ProjectController);

app.listen(process.env.PORT, () => {
  console.log(
    "Project url: https://" + process.env.PORT + ".sock.hicounselor.com"
  );
});
