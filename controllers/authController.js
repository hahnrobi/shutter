const userController = require('../controllers/userController');
const jwt = require('jsonwebtoken');
const jwtGenerator = require('../includes/jwt-generator');
const bcrypt = require('bcryptjs');
const logger = require("../includes/logger");
exports.login = async (req, res) => {
	try {
		if(req.body != "") {
			
			let params = (req.body);
			logger.info("Login attempt to " + params?.email);
			let pwd = "";
			let successfull = false;
  
			let userId;
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
				logger.info("Login sucess for" . params?.email)
				res.send({"token": jwt.sign(token, process.env.SHUTTER_ACCESS_TOKEN_SECRET), "data": token});
			}else {
				res.status(403);
				res.send("Invalid username or password");
			}
		}
	} catch (err) {
		console.log(err);
		res.send(err);
	}
  }