const pool = require("../db");
const ProjectService = require("../service/ProjectService");


exports.getInvestors = () => {
    return new Promise((resolve, reject) => {
        const query = 'select * from investors'
        pool.query(query, (err, result) => {
            if (err) {
                return reject(err)
            }
            console.log(result)
            if (result.length == 0) {
                return reject({
                    success: false,
                    message: 'No investors was found'
                }
                )
            }
            if (result.length > 1) {
                return resolve(
                    {
                        success: true,
                        result
                    }
                )
            }
        })
    })
}

exports.makeInvestment = async ({ project_id, investor_id, amount }) => {
    return new Promise(async (resolve, reject) => {

        if ([project_id, investor_id].some((field) => field == '')) {
            return reject(
                {
                    success: false,
                    message: 'All details required'
                }
            )
        }

        if (amount < 0) {
            return reject({
                success: false,
                message: 'An amount must be greater than zero and positive'
            })
        }
        //check for investor id
        const queryForInvestorId = 'select * from investors where investor_id = ?'
        pool.query(queryForInvestorId, [investor_id], (err, result) => {
            if (err) {
                return reject(err)
            }
            if (result.length == 0) {
                return reject({
                    success: false,
                    message: 'No investor found'
                })
            }
        })

        //check for project detail
        const resultOfProject = await ProjectService.getProjectDetails({ project_id })

        if (!resultOfProject?.success) {
            return reject({
                success: false,
                message: 'Project not found'
            })
        }


        let resultObject = {
            success: true,
        }
        const queryForSumOfTotalFunding = 'SELECT IFNULL(SUM(amount), 0) AS currentFunding FROM investments WHERE project_id = ?';
        pool.query(queryForSumOfTotalFunding, [project_id], (err, result) => {
            if (err) {
                return reject({
                    success: false,
                    message: err.message
                })
            }
            const currentFunding = parseFloat(result[0].currentFunding)
            const balanceAmount = parseFloat(resultOfProject.fundingGoal) - currentFunding
            //checking if the balance amount is less than or equals to zero
            if (balanceAmount <= 0) {
                return reject({
                    success: false,
                    message: 'the funding goal has already been reached.'
                })
            }
            // checking that the investor's amount is less than or equals to the balance amount
            if (amount > balanceAmount) {
                console.log(amount, balanceAmount)
                return reject({
                    success: false,
                    message: 'the investment amount is too high.'
                })
            }
            let timestamp = new Date()
            const queryForInsertRecords = 'insert into investments (amount,	project_id,	timestamp,	investor_id) values (?,?,?,?)'

            pool.query(queryForInsertRecords, [amount, project_id, timestamp, investor_id], (err, resultForInsertRecords) => {
                if (err) {
                    return reject(err)
                }
                if (resultForInsertRecords.affectedRows > 0) {
                    console.log('Data inserted into the investments table')
                    // query to get the result of recently added data
                    const queryToGetResultOfInsertId = 'select * from investments where investment_id = ?'
                    const insertId = resultForInsertRecords.insertId
                    pool.query(queryToGetResultOfInsertId, [insertId], (err, resultOfInsertRecord) => {
                        if (err) {
                            return reject(err)
                        }
                        if (resultOfInsertRecord.length > 0) {
                            resultObject['investmentId'] = resultOfInsertRecord[0].investment_id
                            resultObject['projectId'] = resultOfInsertRecord[0].project_id
                            resultObject['investorId'] = resultOfInsertRecord[0].investor_id
                            resultObject['amountInvested'] = resultOfInsertRecord[0].amount
                            resultObject['timestamp'] = resultOfInsertRecord[0].timestamp
                        }
                        //query to get the investors details
                        const queryForInvestorDetails = 'select * from investors where  investor_id = ?'
                        pool.query(queryForInvestorDetails, [resultObject.investorId], (err, resultOfInvestorDetails) => {
                            if (err) {
                                return reject(err)
                            }
                            if (resultOfInvestorDetails.length > 0) {
                                resultObject['investorName'] = resultOfInvestorDetails[0].investor_name
                                resultObject['invetorEmail'] = resultOfInvestorDetails[0].email
                            }
                            let totalInvestedAmount = resultOfInvestorDetails[0].total_invested_amount + amount
                            //query for update the investors table, total_invested_amount column
                            const queryForUpdateInvestedAmount = 'update investors set total_invested_amount = ? where investor_id = ?'
                            pool.query(queryForUpdateInvestedAmount, [totalInvestedAmount, resultObject.investorId], (err, resultOfNewUpdatedAmount) => {
                                if (err) {
                                    return reject(err)
                                }
                                if (resultOfNewUpdatedAmount.affectedRows > 0) {
                                console.log('Total invested amount updated on the investors table ')
                                }
                                //query for update the project table of current_funding column
                                const queryForUpdateProjectTable = 'update projects set current_funding = ? where id = ?'
                                const totalFundingOfProject = currentFunding + amount

                                console.log('totalFundingOfProject', totalFundingOfProject)
                                pool.query(queryForUpdateProjectTable, [totalFundingOfProject, project_id], (err, resultOfProjectTable) => {
                                    if (err) {
                                        return reject(err)
                                    }
                                    if (resultOfProjectTable.affectedRows > 0) {
                                        console.log('Total current funding column updated on the projects table.')
                                        return resolve(resultObject)
                                    }
                                })
                            })
                        })
                    })
                }
            })
        })
    })
}

exports.getInvestorDashboard = ({ investorId }) => {
    return new Promise((resolve, reject) => {
        const queryForInvestorDetails = 'select * from investors where 	investor_id =?'

        pool.query(queryForInvestorDetails, [investorId], (err, result) => {
            if (err) {
                return reject(err)
            }
            let resultObject = {
                success: true,
                "projectInvestments": []
            }
            if (result.length > 0) {
                resultObject['investorId'] = result[0].investor_id
                resultObject['investorName'] = result[0].investor_name
                resultObject['email'] = result[0].email
                resultObject['totalInvestedAmount'] = result[0].total_invested_amount == null ? 0 : result[0].total_invested_amount
            }

            const queryForProjectsDetailsFromInvestments = 'select * from investments where investor_id = ?'

            pool.query(queryForProjectsDetailsFromInvestments, [investorId], (err, resultOfInvestments) => {
                if (err) {
                    console.log(err)
                    return reject(err)
                }
                if (resultOfInvestments.length > 0) {
                    resultObject.projectInvestments = resultOfInvestments.map((investment) => ({
                        projectId: investment.project_id
                    }))
                }


                const projectInvestmentDetailsPromise = resultObject.projectInvestments.map((investment, i) => {
                    return new Promise((resolve, reject) => {

                        const queryForProjectDetails = 'select * from projects where id = ?'
                        pool.query(queryForProjectDetails, [investment?.projectId], (err, resultOfProjectQuery) => {
                            if (err) {
                                return reject(err)
                            }
                            if (resultOfProjectQuery.length > 0) {
                                resultObject.projectInvestments[i].title = resultOfProjectQuery[0].title
                                resultObject.projectInvestments[i].category = resultOfProjectQuery[0].category
                                resultObject.projectInvestments[i].fundingGoal = resultOfProjectQuery[0].funding_goal
                                resultObject.projectInvestments[i].investedAmount = resultOfProjectQuery[0].current_funding
                            }
                            resolve()

                        })




                    })
                })
              
                Promise.all(projectInvestmentDetailsPromise)
                    .then(() => {
                        console.log(resultObject)
                        return resolve(resultObject); // Resolve the main promise with resultObject after all project details are added
                    })
                    .catch(error => reject(error));
            })
        })
    })
}
exports.submitFeedback = async ({ investorId, rating, comment, project_id }) => {


    return new Promise(async (resolve, reject) => {
        if (rating < 0 && rating > 6) {
            return reject({
                success: false,
                message: 'The rating is invalid.'
            })
        }
        if (comment.trim() == '') {
            return reject({
                success: false,
                message: 'The comment is invalid.'
            })
        }

        const queryProjectDetails = 'select * from projects where id = ?'

        pool.query(queryProjectDetails, [project_id], (err, resultOfProject) => {
            if (err) {
                return reject(err)
            }
            if (resultOfProject.length == 0) {
                return reject({
                    success: false,
                    message: `No project with project id ${project_id} found`
                })
            }
          

            const queryForInvestorDetails = 'select * from investors where 	investor_id = ?'
            pool.query(queryForInvestorDetails, [investorId], (err, resultOfInvestor) => {
                if (err) {
                    return reject(err)
                }
                if (resultOfInvestor.length == 0) {
                    return reject({
                        success: false,
                        message: 'Investor not exist from the given ID'
                    })
                }
                if (resultOfInvestor.length > 0) {
                    const queryToInsertRecords = 'insert into feedbacks (comment, investor_id, project_id, rating, timestamp) values(?,?,?,?,?)'
                    const timestamp = new Date()
                  
                    pool.query(queryToInsertRecords, [comment, investorId, project_id, rating, timestamp], (err, resultOfInsertRecord) => {
                        if (err) {
                            return reject(err)
                        }
                        if (resultOfInsertRecord.affectedRows > 0) {
                            const insertId = resultOfInsertRecord.insertId
                            const queryToGetTheResult = 'select * from feedbacks where feedback_id = ?'
                            pool.query(queryToGetTheResult, [insertId], (err, resultOfFinalResult) => {
                                if (err) {
                                    return reject(err)
                                }
                                if (resultOfFinalResult.length > 0) {
                                    // console.log('resultOfFinalResult', resultOfFinalResult)
                                    return resolve({
                                        success: true,
                                        "feedbackId": resultOfFinalResult[0].feedback_id,
                                        "projectId": resultOfFinalResult[0].project_id,
                                        "investorId": resultOfFinalResult[0].investor_id,
                                        "rating": resultOfFinalResult[0].rating,
                                        "comment": resultOfFinalResult[0].comment,
                                        "timestamp": resultOfFinalResult[0].timestamp,
                                    })
                                }
                            })
                        }
                    })
                }
            })
        })
    })
}