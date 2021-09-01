const express = require("express");
const app = express();
const fs = require('fs');

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

app.get('/', (req, res) => {
	res.redirect('/'+uuidV4());
});

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



server.listen(4430);
//server_https.listen(4430);

