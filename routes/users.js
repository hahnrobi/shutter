const userController = require('../controllers/userController');
const express = require('express');
const router = express.Router();
const validateToken = require("../includes/validate-token");

module.exports = router;


router.post('/api/user', async function(request, reply) {
	return userController.addUser(request, reply);
});

router.put('/api/user/:id', validateToken.validateToken, async function(request, reply) {
	const userId = request.user;
	return userController.updateUser(request, reply, userId);
});

router.put('/api/user/newpass/:id', validateToken.validateToken, async function(request, reply) {
	const userId = request.user;
	return userController.changePassword(request, reply, userId);
});	
router.get('/api/user-me/', validateToken.validateToken, async function(req, res) {
	req.params.id = req.user;
	return userController.getSingleUser(req, res);
});