const allowedOrigins = require("./allowedOrigins");

const corsOptions = {
	origin: (origin, callback) => {
		if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
			callback(null, true);
		} else {
			callback(new Error("Not Allowed by CORS!"));
		}
	},
	// add this line and you don't have to create another middleware to set the request header's Access-Control-Allow-Credentials to true
	// in the previous 'mern-stack auth' project you add the middleware called 'credentials' to set the 'ACAC' to true
	credentials: true,
	optionSuccessStatus: 200,
};

module.exports = corsOptions;
