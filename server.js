const express = require("express");
const app = express();
const fs = require('fs');
const mongoose = require('mongoose')


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
	socket.on('join-room', (roomId, userId) => {
		console.log(roomId + " " + userId);
		socket.join(roomId);
		socket.to(roomId).broadcast.emit('user-connected', userId);

		socket.on('disconnect', () => {
			socket.to(roomId).broadcast.emit('user-disconnected', userId);
		});

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

