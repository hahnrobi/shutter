const express = require("express");
const app = express();
const fs = require('fs');
const mongoose = require('mongoose')
const roomController = require("./controllers/roomController");
const bcrypt = require('bcryptjs');
const validateToken = require("./includes/validate-token");
const winston = require('winston');
const expressWinston = require('express-winston');
const { ExpressPeerServer } = require('peer');

require('dotenv').config();

const logger = winston.createLogger({
	level: 'info',
	format:  winston.format.combine(winston.format.json(), winston.format.prettyPrint()),
	defaultMeta: { service: 'user-service' },
	transports: [
	  //
	  // - Write all logs with level `error` and below to `error.log`
	  // - Write all logs with level `info` and below to `combined.log`
	  //
	  new winston.transports.File({filename: "/dev/stderr", level: "warn"}),
      new winston.transports.File({filename: "/dev/stdout"}),
	  new winston.transports.File({ filename: 'error.log', level: 'error' }),
	  new winston.transports.File({ filename: 'combined.log' }),
	  
	],
  });


//const server = require("http").Server(app);
const server = require('https').Server({
	key: fs.readFileSync(__dirname + '/certs/private.key'),
	cert: fs.readFileSync(__dirname + '/certs/cert.crt')
}, app)
const io = require('socket.io')(server);
const {v4: uuidV4} = require('uuid');



function getRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
  }

app.set('view engine', 'ejs');
app.use(express.static('public/dist/shutter'));
app.use(express.json());

app.use('/peerjs', require('peer').ExpressPeerServer(server, {
	debug: true
}))



app.use(expressWinston.logger({
	transports: [
	  new winston.transports.Console()
	],
	format: winston.format.combine(
	  winston.format.colorize(),
	  winston.format.json()
	),
	meta: true, // optional: control whether you want to log the meta data about the request (default to true)
	msg: "HTTP {{req.method}} {{req.url}}", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
	expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
	colorize: false, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
	ignoreRoute: function (req, res) { return false; } // optional: allows to skip some log messages based on request and/or response
  }));

app.get('/', (req, res) => {
	res.redirect('/'+uuidV4());
});


app.use(require('./routes/auth'))
app.use(require('./routes/rooms'))
app.use(require('./routes/users'))


app.get("/assets/i18n/:file", (req, res) => {
	res.redirect("/dist/shutter/assets/i18n/"+req.params.file);
})

app.get('/:room(*)', (req, res) => {
	res.render('room', {roomId: req.params.room});
})


io.on('connection', socket => {
	socket.on('user-token', (token) => {
		console.log(token);
		try {
			tk = validateToken.isTokenValid(token);
			console.log("[TOKEN] Received token for: " + socket.id + ", with token:", tk);
			if(tk !== false) {
				socket.userId = tk.user;
			}
		}catch(err) {
			console.log("Error in receiving user token.");
			console.log(err);
			socket.userId = undefined;
		}
	})
	socket.on('join-room', async (roomId, user, auth = {}) => {
		let roomData;
		console.log("Auth data: ", auth);
		try {
			roomData = await roomController.getSingleRoomFromDb(roomId, true);
		}
		catch (err) {
			roomData = null;
		}
		console.log("Connecting socket: " + socket.id);

		let canJoin = true;
		let authType = null;

		let correctPassword = false;

		if(roomData != null || roomData != undefined) {
			if(roomData.hasOwnProperty("auth_type")) {
				if(roomData.auth_type == "password") {
					authType = "password";
					console.log("Room is protected by password.");
					let correct = false;
					if(auth.hasOwnProperty("submittedPassword")) {
						console.log("User loggin in with password: ", auth.submittedPassword);
						correct = bcrypt.compareSync(auth.submittedPassword, roomData.auth_password);
					}
					if(!correct) canJoin = false;
				} if(roomData.auth_type == "approve") {
					authType = "approve";
					console.log("Approval needed to enter.");
					canJoin = false;

					if(auth.hasOwnProperty("token")) {
						const token = validateToken.isTokenValid(auth.token)
						if(token !== false) {
							if(roomData.owner._id === token.user) {
								//the owner wants to join
								canJoin = true;
								socket.userId = token.user;
								console.log("The user is the owner of the room.");

							} else {
								if(roomController.isUserApprovedToRoom(roomId, token.user)) {
									canJoin = true;
									socket.userId = token.user;
									console.log("The user is already approved to the room.");
								}
								//TODO: someone else (with account), check if they're already approved to toom
							}
						}
					}
				}
			}
		}
		
		if(canJoin) {
			console.log(socket.id + " user can join");
			socket.emit('join-room-answer', {result: "successful"});
			joinUserToRoom(socket, user, roomId);
		}else {
			if(authType == "password" && !correctPassword) {
				socket.emit('join-room-answer', {result: "failed", reason: "wrong_password"});
				console.log("[ " + socket.id + " ] Wrong password");
			} else if(authType == "approve") {
				const room = io.sockets.adapter.rooms.get(roomId);
					let ownerInRoom = false;
					if(room != undefined) {
						const clients = Array.from(room);
						if(clients != null || clients != undefined) {
							clients.forEach(id => {
								let searchSocket = io.sockets.sockets.get(id);
								if(searchSocket != undefined && searchSocket.userId == roomData.owner._id) {
									ownerInRoom = true;

									socket.once('disconnect', () => {
										searchSocket.emit('waiting-user-disconnected', socket.id);
									});

									socket.emit("join-room-answer", {result: "failed", reason: "waiting_approval"});
									console.log("[ " + socket.id + " ] Waiting on approval");

									let token = false;
									if(auth.token) {
										token = validateToken.isTokenValid(auth.token);
									}
									console.log(token);
									searchSocket.emit("join-room-request", socket.id, user, token !== false);
									console.log("[ " + socket.id + " ] Sending auth request to owner.");

									searchSocket.on('join-room-request-answer', (reply, socketId, permanent) => {
										console.log("[ " + socket.id + " ] Owner replied to auth request.");
										if(reply === true) {
											socket.emit('join-room-answer', {result: "successful"});
											console.log("[ " + socket.id + " ] Owner approved user to the room.");
											if(permanent) {
												roomController.approveUserToRoom(roomId,token.user);
												console.log("[ " + socket.id + " ] PERMANENT APPROVE.");
											}
											joinUserToRoom(socket, user, roomId);
										}else {
											console.log("[ " + socket.id + " ] Owner denied the approval request.");
											socket.emit("join-room-answer", {result: "failed", reason: "approval_denied"});
										}
									});
								}
							})
						}

					}
					if(!ownerInRoom) {
						socket.emit("join-room-answer", {result: "failed", reason: "no_auth_user"});
						console.log("[ " + socket.id + " ] Owner is not in the room for auth.");
					}

			} else {
				socket.emit('join-room-answer', {result: "failed", reason: "error"});
				console.log("[ " + socket.id + " ] Err");
			}
		}

	});
})

function joinUserToRoom(socket, user, roomId) {
	console.log("Room: "+ roomId + " new user: " + user.status.clientId);
	socket.join(roomId);
	socket.to(roomId).broadcast.emit('user-connected', user);

	socket.once('disconnect', () => {
		console.log("Room: "+ roomId + " disconnected: " + user.status.clientId);
		socket.to(roomId).broadcast.emit('user-disconnected', user);
	});
}



const jsonErrorHandler = async (err, req, res, next) => {
	res.status(500).send({ error: err });
  }

  app.use(jsonErrorHandler)




const start = async() => {
	try {
		await server.listen(4430);
		mongoose.connect('mongodb://localhost/shutter')
 		.then(() => console.log('MongoDB connected…'))
 		.catch(err => console.log(err));
	}
	catch(err) {
		console.log("Error: ", err);
		process.exit(1);
	}
}


start();
//server_https.listen(4430);
