const express = require("express");
const app = express();
const fs = require('fs');
const mongoose = require('mongoose')
const roomController = require("./controllers/roomController");
const bcrypt = require('bcryptjs');

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
	socket.on('join-room', async (roomId, user, auth = {}) => {
		let roomData;
		try {
			roomData = await roomController.getSingleRoomFromDb(roomId, true);
		}
		catch (err) {
			roomData = null;
		}
		console.log(socket.id);

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
				}
			}
		}
		
		if(canJoin) {
			socket.emit('join-room-answer', {result: "successful"});
			console.log(roomId + " " + user.status.clientId);
			socket.join(roomId);
			socket.to(roomId).broadcast.emit('user-connected', user);

			socket.once('disconnect', () => {
				socket.to(roomId).broadcast.emit('user-disconnected', user);
			});
		}else {
			if(authType == "password" && !correctPassword) {
				socket.emit('join-room-answer', {result: "failed", reason: "wrong_password"});
				console.log("[ " + socket.id + " ] Wrong password");
			} else if(authType == "approve") {
				socket.emit('join-room-answer', {result: "failed", reason: "waiting_approval"});
				console.log("[ " + socket.id + " ] Waiting on approval");
			} else {
				socket.emit('join-room-answer', {result: "failed", reason: "error"});
				console.log("[ " + socket.id + " ] Err");
			}
		}

	});
})





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

