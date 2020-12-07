/* response generation library for api */
let generate = (err, message, status, errorDetail, data) => {
    let response = {
        status: status,
        error: err,
        message: message,
        errorDetail: errorDetail,
        data: data
    }
    return response
}

module.exports = {
    generate: generate
}