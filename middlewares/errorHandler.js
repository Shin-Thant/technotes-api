const { logEvents } = require("./logger");

const errorHandler = (err, req, res, next) => {
	logEvents(
		`${err.name}\t${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,
		"errLog.log"
	);

	const status = res.statusCode ? res.statusCode : 500;

	// adding 'isError: true' is what the rtk query looks for. with this way rtk query will flag these messages as errors
	res.status(status).json({ message: err.message, isError: true });
};

module.exports = errorHandler;
