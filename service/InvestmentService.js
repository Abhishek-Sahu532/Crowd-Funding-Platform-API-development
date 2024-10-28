const pool = require("../db");


exports.getInvestors = () => {
    return new Promise((resolve, reject) => {
        const query = 'select * from investments'
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

exports.makeInvestment = () => ({ msg: "test" });
exports.getInvestorDashboard = () => ({ msg: "test" });
exports.submitFeedback = () => ({ msg: "test" });

