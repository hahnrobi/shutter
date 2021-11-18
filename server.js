const express = require("express");
const app = express();
const fs = require('fs');
const mongoose = require('mongoose')
const roomController = require("./controllers/roomController");
const bcrypt = require('bcryptjs');
const validateToken = require("./includes/validate-token");
const winston = require('winston');
const expressWinston = require('express-winston');
const ExpressPeerServer = require('peer').ExpressPeerServer;
const logger = require('./includes/logger');
const rtc = require('./includes/rtc');


  require('dotenv').config()
//const server = require("http").Server(app);
certPath = __dirname + "/certs/cert.crt";
privateKeyPath = __dirname +"/certs/private.key";

if(process.env.SSL_CERT) {
	certPath = __dirname + process.env.SSL_CERT;
}

if(process.env.SSL_PRIVATE_KEY) {
	privateKeyPath = __dirname + process.env.SSL_PRIVATE_KEY;
}

logger.info("Using SSL certificate from: ", certPath);
logger.info("Using SSL private key from: ", privateKeyPath);


const server = require('https').Server({
	key: fs.readFileSync(privateKeyPath),
	cert: fs.readFileSync(certPath)
}, app)
const io = require('socket.io')(server);

rtc(io);



app.use(express.static('public/dist/shutter'));
app.use(express.json());

app.use('/peerjs', ExpressPeerServer(server, {
	debug: true
}))

app.use(expressWinston.logger({
	transports: [
	  new winston.transports.Console({
		  format: winston.format.combine(
			winston.format.colorize({
			}),
			winston.format.timestamp({format: 'MMM-DD-YYYY HH:mm:ss'}),
			winston.format.align(),
			winston.format.printf(info => `${info.level}: ${[info.timestamp]}: ${info.message}`))
	  }),
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
		winston.format.timestamp({format: 'MMM-DD-YYYY HH:mm:ss'}),
		winston.format.align(),
		winston.format.printf(info => `${info.level}: ${[info.timestamp]}: ${info.message}`),
	),
	meta: true,
	msg: "HTTP {{req.method}} {{req.url}}",
	expressFormat: true,
	colorize: true,
	dynamicMeta: (req, res) => {
        const httpRequest = {}
        const meta = {}
        if (req) {
            meta.httpRequest = httpRequest
            httpRequest.requestMethod = req.method
            httpRequest.requestUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`
            httpRequest.protocol = `HTTP/${req.httpVersion}`
            httpRequest.remoteIp = req.ip.indexOf(':') >= 0 ? req.ip.substring(req.ip.lastIndexOf(':') + 1) : req.ip   // just ipv4
            httpRequest.requestSize = req.socket.bytesRead
            httpRequest.userAgent = req.get('User-Agent')
            httpRequest.referrer = req.get('Referrer')
        }
        return meta
    },
	ignoreRoute: function (req, res) { return false; } // optional: allows to skip some log messages based on request and/or response
  }));


app.use(require('./routes/auth'))
app.use(require('./routes/rooms'))
app.use(require('./routes/users'))


app.get("/assets/i18n/:file", (req, res) => {
	res.redirect("/dist/shutter/assets/i18n/"+req.params.file);
})

app.all('*', function(req, res){
	res.sendFile(__dirname + "/public/dist/shutter/index.html");
});





const jsonErrorHandler = async (err, req, res, next) => {
	res.status(500).send({ error: err });
  }

app.use(jsonErrorHandler)


const start = async() => {
	try {
		logger.info("Starting up...")
		
		let mongoConnectionString = "mongodb://127.0.0.1:27017/shutter";
		if(process.env.DB_CONN) {
			mongoConnectionString = process.env.DB_CONN;
		}
		logger.info("Connecting to server on address: " + mongoConnectionString); 
		mongoose.connect(mongoConnectionString)
		//mongoose.connect('mongodb://127.0.0.1/shutter')
 		.then(async () => {
			 logger.info('MongoDB connected…')
			 await server.listen(4430);
			 logger.info("Server running!");
			})
 		.catch(err => logger.error(err));
	}
	catch(err) {
		logger.error("Error: ", err);
		process.exit(1);
	}
}

start();
