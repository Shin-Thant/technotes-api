const rateLimit = require("express-rate-limit");
const { logEvents } = require("./logger");

const loginLimiter = rateLimit({
	windowMs: 60 * 1000, // 1 minute
	max: 5, // limit each IP to 5 login per 'window' per minute
	message: {
		message:
			"Too many login attempts from this IP, please try again after a 60 second puase",
	},
	handler: (req, res, next, options) => {
		logEvents(
			`Too Many Request: ${options.message.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,
			"errorLog.log"
		);

		res.status(options.statusCode).send(options.message);
	},
	standardHeaders: true,
	legacyHeaders: false,
});

module.exports = loginLimiter;
