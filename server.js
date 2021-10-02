const express = require("express");
const app = express();
const fs = require('fs');
const mongoose = require('mongoose')
const roomController = require("./controllers/roomController");
const bcrypt = require('bcryptjs');
const validateToken = require("./includes/validate-token");

require('dotenv').config();

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
app.use(express.static('public'));
app.use(express.json());

app.get('/', (req, res) => {
	res.redirect('/'+uuidV4());
});
app.get("/assets/i18n/:file", (req, res) => {
	res.redirect("/dist/shutter/assets/i18n/"+req.params.file);
})

app.get('/:room', (req, res) => {
	res.render('room', {roomId: req.params.room});
})

io.on('connection', socket => {
	socket.on('user-token', (token) => {
		try {
			tk = validateToken.isTokenValid(token);
			console.log("received token for: " + socket.id + ", with token:", tk);
			if(tk !== false) {
				socket.userId = tk.user;
			}
		}catch(err) {
			socket.userId = undefined;
		}
	})
	socket.on('join-room', async (roomId, user, auth = {}) => {
		let roomData;
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
					let correct = false;
					if(auth.hasOwnProperty("submittedPassword")) {
						console.log("User loggin in with password: ", auth.submittedPassword);
						correct = bcrypt.compareSync(auth.submittedPassword, roomData.auth_password);
					}
					if(!correct) canJoin = false;
				}else {
					authType = "approve";
					canJoin = false;

					if(socket.userId != undefined) {
						if(roomData.owner._id === socket.userId) {
							//the owner wants to join
							canJoin = true;


						} else {
							//TODO: someone else (with account), check if they're already approved to toom
						}
					}
				}
			}
		}
		
		if(canJoin) {
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
									searchSocket.emit("join-room-request", socket.id, user);
									console.log("[ " + socket.id + " ] Sending auth request to owner.");
									searchSocket.on('join-room-request-answer', (reply, socketId) => {
										console.log("[ " + socket.id + " ] Owner replied to auth request.");
										if(reply === true) {
											socket.emit("join-room-answer", {result: "successful"});
											console.log("[ " + socket.id + " ] Owner approved user to the room.");
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
						socket.emit("join-room-answer", {result: "failed", reason: "approval_denied"});
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
		socket.to(roomId).broadcast.emit('user-disconnected', user);
	});
}



const jsonErrorHandler = async (err, req, res, next) => {
	res.status(500).send({ error: err });
  }

  app.use(jsonErrorHandler)


app.use(require('./routes/auth'))
app.use(require('./routes/rooms'))
app.use(require('./routes/users'))

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

