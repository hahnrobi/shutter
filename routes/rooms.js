const roomController = require('../controllers/roomController');
const express = require('express');
const router = express.Router();
const validateToken = require("../includes/validate-token");

module.exports = router;

router.get("/api/rooms", async (req, res) => {
	let rooms = await roomController.getRooms(req, res)
	res.send(rooms);
})

router.get("/api/rooms/:id", (req, res) => {
	roomController.getSingleRoom(req, res);
})
router.post('/api/rooms', validateToken.validateToken, async function(request, reply) {
	const userId = request.user;
	return roomController.addRoom(request, reply, userId);
});
router.put('/api/rooms/:id', validateToken.validateToken, async function(request, reply) {
	const userId = request.user;
	return roomController.updateRoom(request, reply, userId);
}),

router.delete('/api/rooms/:id', validateToken.validateToken, async function(request, reply) {
	const userId = request.user;
	return roomController.deleteRoom(request, reply, userId);
});

router.get("/api/rooms-self/", validateToken.validateToken, async (req, res) => {
	const userId = req.user;
	roomController.getRoomsForUser(req, res, userId);
})