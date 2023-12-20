const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode ? res.statusCode : 500;
    console.log(statusCode);
    switch (statusCode){
        case 400:
            res.json({
                title: "Validation Failed",
                message: err.message,
                stackTrance: err.stack,
            });
            break;
        case 401:
            res.json({
                title: "Unauthorized",
                message: err.message,
                stackTrance: err.stack,
            });
            break;
        case 404:
            res.json({
                title: "Not Found",
                message: err.message,
                stackTrance: err.stack,
            });
            break;
        case 403:
            res.json({
                title: "Forbidden",
                message: err.message,
                stackTrance: err.stack,
            });
            break;
        case 500:
            res.json({
                title: "Server Error",
                message: err.message,
                stackTrance: err.stack,
            });
            break;
        case 200:
            console.log("No Error, All good!, code 200");
            // next()
            break;

        default:
            console.log("No Error, All good!");
            break;
    }
}

module.exports = errorHandler;