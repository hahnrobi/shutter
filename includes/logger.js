const winston = require('winston');
module.exports = logger = winston.createLogger({
	transports: [
	  new winston.transports.Console(),
	  new winston.transports.File({ filename: 'error.log', level: 'error' }),
	  new (require("winston-daily-rotate-file"))({
		filename: 'combined.log',
		format: winston.format.combine(
			winston.format.timestamp({format: 'MMM-DD-YYYY HH:mm:ss'}),
        	winston.format.align(),
        	winston.format.printf(info => `${info.level}: ${[info.timestamp]}: ${info.message}`),
		)
	}),
	],
	format: winston.format.combine(
		winston.format.colorize({
			all:true
		}),
		winston.format.timestamp({format: 'MMM-DD-YYYY HH:mm:ss'}),
		winston.format.align(),
		winston.format.printf(info => `${info.level}: ${[info.timestamp]}: ${info.message}`),
	),
	meta: true, // optional: control whether you want to log the meta data about the request (default to true)
	msg: "HTTP {{req.method}} {{req.url}}", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
	expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
	colorize: false, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
	ignoreRoute: function (req, res) { return false; } // optional: allows to skip some log messages based on request and/or response
	
  });