const pool = require("../db");

exports.createProject = async ({ title, description, category, fundingGoal, currentFunding }) => {

    if ([title, description, category].some((field) => field == '')) {
        return {
            success: false,
            message: 'the project information is incomplete.'
        }
    }

    if (fundingGoal <= 0) {
        return {
            success: false,
            message: 'the funding goal cannot be negative or 0.'
        }
    }

    const queryForTitle = 'select * from projects where title = ?'

    try {
        return await new Promise((resolve, reject) => {
            pool.query(queryForTitle, title, (err, result) => {
                if (err) {
                    return reject(err)
                }
                console.log('firstresult', result)
                console.log('firstresult', result.length)
                if (result?.length > 0) {
                    return reject({
                        success: false,
                        message: 'the project with the same title already exists.'
                    })
                }

                if (result.length == 0) {
                    const queryForInsertRecords = 'INSERT INTO projects (title, description, category, funding_goal, current_funding, created_at, updated_at ) VALUES (?,?,?,?,?,?,?)';

                    let time = new Date();
                    // Helper function to pad single-digit months and days with a leading zero
                    const pad = (number) => number.toString().padStart(2, '0');
                    const createdAt = `${time.getFullYear()}-${pad(time.getMonth() + 1)}-${pad(time.getDate())}`;
                    const updatedAt = `${time.getFullYear()}-${pad(time.getMonth() + 1)}-${pad(time.getDate())}`;

                    pool.query(queryForInsertRecords, [title, description, category, fundingGoal.toFixed(2), currentFunding.toFixed(2), createdAt, updatedAt], (err, result) => {
                        if (err) {
                            return reject(err)
                        }

                        if (result.affectedRows > 0) {
                            const queryForFinalResult = 'select * from projects where id = ?'
                            const insertId = result.insertId
                            pool.query(queryForFinalResult, insertId, (err, result) => {
                                if (err) {
                                    return reject(err)
                                }

                                if (result.length > 0) {
                                    return resolve({
                                        success: true,
                                        "id": result[0].id,
                                        "title": result[0].title,
                                        "description": result[0].description,
                                        "category": result[0].category,
                                        "fundingGoal": result[0].funding_goal,
                                        "currentFunding": result[0].current_funding,
                                        "createdAt": result[0].created_at,
                                        "updatedAt": result[0].updated_at
                                    })
                                }
                            })

                        }
                    })
                }
            })
        })
    } catch (error) {
        return {
            success: false,
            message: error?.message
        }
    }
};
exports.getAllProjects = () => {
    try {

        return new Promise((resolve, reject) => {
            const query = 'select * from projects'

            pool.query(query, (err, result) => {
                if (err) {
                    return reject(err)
                }
                console.log(result)

                if (result.length == 0) {
                    return reject({
                        success: false,
                        message: 'no project data was found'
                    })
                }
                if (result.length > 0) {
                    return resolve(result)
                }
            })
        })
    } catch (error) {
        return {
            success: false,
            messsage: error?.message
        }
    }
}
exports.getProjectsByCategory = ({category}) => {
    try {
        return new Promise((resolve, reject) => {
            const query = 'select * from projects where category = ?'
            pool.query(query, category, (err, result) => {
                if (err) {
                    return reject(err)
                }
                if (result.length == 0) {
                    return reject({
                        success: false,
                        message: ' the project was not found in the specified category.'
                    })
                }
                if (result.length > 0) {
                    return resolve({
                        success: true,
                        result
                    })
                }
            })
        })
    } catch (error) {
        return {
            success: false,
            message: error?.message
        }
    }
}

exports.getProjectDetails = async ({ project_id }) => {
    try {
        return new Promise((resolve, reject) => {
            const queryForProjectDetails = 'SELECT * FROM projects WHERE id = ?';
            pool.query(queryForProjectDetails, [project_id], (err, result) => {

                if (err) {
                    return reject(err)
                }
                if (result.length === 0) {
                    return reject(
                        {
                            success: false,
                            message: `No project with project id ${project_id} found`
                        }
                    )
                }

                const projectDetails = {
                    success: true,
                    "id": result[0].id,
                    "title": result[0].title,
                    "description": result[0].description,
                    "category": result[0].category,
                    "fundingGoal": result[0].funding_goal,
                    "currentFunding": result[0].current_funding,
                    "createdAt": result[0].created_at,
                    "updatedAt": result[0].updated_at,
                    "feedbacks": []
                }

                const queryForFeedback = 'SELECT * FROM feedbacks WHERE project_id = ?';
                pool.query(queryForFeedback, [project_id], (feedbackErr, feedbackResult) => {
                    if (feedbackErr) {
                        return reject(feedbackErr)
                    }

                    console.log('feedbackResult', feedbackResult)

                    projectDetails.feedbacks = feedbackResult
                    return resolve(projectDetails)
                })
            })
        })
    } catch (error) {
        return {
            success: false,
            message: error?.message || 'An error occurred'
        }
    }
};

exports.getInvestmentDetailsByProjectId = () => ({ msg: "test" });
