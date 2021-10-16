const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const jwt = require('jsonwebtoken');
const jwtGenerator = require('../includes/jwt-generator');
const bcrypt = require('bcryptjs');
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
router.post('/api/auth/login', async (req, res) => {
  try {
	  if(req.body != "") {
		  let params = eval(req.body);
		  let pwd = "";
		  let successfull = false;

		  let userId;
		  console.log(req.body);
		  console.log(params.email);
		  try {
			  let u = await userController.getSingleUserByEmail(params.email);
			  if(u != null) {
				  userId = u.id;
				  pwd = await userController.getSingleUserPassword(u.id);
				  let correct = bcrypt.compareSync(params.password, pwd);
				  successfull = correct;
			  }
		  }
		  catch(err) {
			  successfull = false;
			  console.log(err);
		  }
		  if(successfull) {
			  let token = jwtGenerator.generate({"user":userId});
			  res.send({"token": jwt.sign(token, process.env.SHUTTER_ACCESS_TOKEN_SECRET), "data": token});
		  }else {
			  res.status(403);
			  res.send("Invalid username or password");
		  }
	  }
  } catch (err) {
	  res.send(err);
  }
})
