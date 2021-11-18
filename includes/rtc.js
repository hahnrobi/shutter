

module.exports = sockets;
function sockets(io) {
	const logger = require('../includes/logger');
	const roomController = require("../controllers/roomController");
	const bcrypt = require('bcryptjs');
	const validateToken = require("../includes/validate-token");

	io.on('connection', socket => {
		socket.on('user-token', (token) => {
			try {
				tk = validateToken.isTokenValid(token);
				logger.info("[TOKEN] Received token for: " + socket.id + ", with token:", tk);
				if(tk !== false) {
					socket.userId = tk.user;
				}
			}catch(err) {
				logger.error("Error in receiving user token: ", err);
				socket.userId = undefined;
			}
		})
		socket.on('join-room-request-answer', (roomId, reply, socketId, permanent) => {
			handleOwnerReply(socket, reply, socketId, permanent, roomId);
		});
		socket.on('join-room', async (roomId, user, auth = {}) => {
			socket.user = user;
			let roomData;
			logger.info("Auth data for room "+roomId+": " + JSON.stringify(auth));
			try {
				roomData = await roomController.getSingleRoomFromDb(roomId, true);
			}
			catch (err) {
				roomData = null;
			}
			logger.info("Connecting socket: " + socket.id);
	
			let canJoin = true;
			let authType = null;
	
			let correctPassword = false;
	
			if(roomData != null || roomData != undefined) {
				if(roomData.hasOwnProperty("auth_type")) {
					if(roomData.auth_type == "password") {
						authType = "password";
						logger.info("Room is protected by password.");
						let correct = false;
						if(auth.hasOwnProperty("submittedPassword")) {
							logger.info("User login in with password: ", auth.submittedPassword);
							correct = bcrypt.compareSync(auth.submittedPassword, roomData.auth_password);
						}
						if(!correct) canJoin = false;
					} if(roomData.auth_type == "approve") {
						authType = "approve";
						logger.info("Approval needed to enter.");
						canJoin = false;
	
						if(auth.hasOwnProperty("token")) {
							const token = validateToken.isTokenValid(auth.token)
							if(token !== false) {
								if(roomData.owner._id === token.user) {
									//the owner wants to join
									canJoin = true;
									socket.userId = token.user;
									logger.info("The user is the owner of the room.");
	
								} else {
									if(roomController.isUserApprovedToRoom(roomId, token.user)) {
										canJoin = true;
										socket.userId = token.user;
										logger.info("The user is already approved to the room.");
									}
									//TODO: someone else (with account), check if they're already approved to toom
								}
							}
						}
					}
				}
			}
			
			if(canJoin) {
				logger.info(socket.id + " " + "(" + socket.user?.name + ") user can join");
				socket.emit('join-room-answer', {result: "successful"});
				joinUserToRoom(socket, user, roomId);
			}else {
				if(authType == "password" && !correctPassword) {
					socket.emit('join-room-answer', {result: "failed", reason: "wrong_password"});
					logger.warn("[ " + socket.id + " ] Wrong password");
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
										logger.info("[ " + socket.id + " ] Waiting on approval");
	
										let token = false;
										if(auth.token) {
											token = validateToken.isTokenValid(auth.token);
										}
										searchSocket.emit("join-room-request", socket.id, user, token !== false);
										logger.info("[ " + socket.id + " ] Sending auth request to owner: " + searchSocket.id + "(" + searchSocket.user?.name + ")");
									}
								})
							}
	
						}
						if(!ownerInRoom) {
							socket.emit("join-room-answer", {result: "failed", reason: "no_auth_user"});
							logger.info("[ " + socket.id + " ] Owner is not in the room for auth.");
						}
	
				} else {
					socket.emit('join-room-answer', {result: "failed", reason: "error"});
					logger.error("[ " + socket.id + " ] Err");
				}
			}
	
		});
	})
	async function handleOwnerReply(socket, reply, repliedsocketId, permanent, roomId) {
		roomData = await roomController.getSingleRoomFromDb(roomId, true);
		if(roomData.owner._id != socket.userId) {
			return;
		}
		let joiningSocket = io.sockets.sockets.get(repliedsocketId)
		if(!joiningSocket) {
			return;
		}
		let userObj = joiningSocket.user;
		logger.info("[ " + socket.id + " ] Owner replied to auth request for " + joiningSocket.id + " (" + userObj.name + ")");
			if(reply === true) {
				joiningSocket.emit('join-room-answer', {result: "successful"});
				logger.info("[ " + socket.id + " ] Owner approved user to the room: " + repliedsocketId + " (" + userObj?.name + ")");
				if(permanent) {
					roomController.approveUserToRoom(roomId,token.user);
					logger.info("[ " + socket.id + " ] PERMANENT APPROVE.");
				}
				joinUserToRoom(joiningSocket, userObj, roomId);
			}else {
				logger.info("[ " + socket.id + " ] Owner denied the approval request for " + repliedsocketId + " ("+userObj?.name+")");
				joiningSocket.emit("join-room-answer", {result: "failed", reason: "approval_denied"});
			}
	}
	
	function joinUserToRoom(socket, user, roomId) {
		logger.info("Room: "+ roomId + " new user: " + user.status.clientId);
		socket.join(roomId);
		socket.to(roomId).broadcast.emit('user-connected', user);
	
		socket.once('disconnect', () => {
			logger.info("Room: "+ roomId + " disconnected: " + user.status.clientId);
			socket.to(roomId).broadcast.emit('user-disconnected', user);
		});
	}
	
}