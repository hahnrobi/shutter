const express = require('express');
const router = express.Router();
const authController = require("../controllers/authController");
const validateToken = require("../includes/validate-token");

module.exports = router;

router.get('/api/protected', validateToken.validateToken, function(req, res) {
	console.log(req.user);
	res.send("Hello " + req.user);
});
router.delete('/api/auth/logout', async(req, res) => {
	res.send({"message": "goodbye"});
	res.sendStatus(200);
})
router.post('/api/auth/login', authController.login)
