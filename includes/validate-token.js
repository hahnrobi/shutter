const jwt = require("jsonwebtoken");

module.exports.validateToken = (req, res, next) => {
	const headerAuth = req.headers['authorization'];
	const token = headerAuth && headerAuth.split(' ')[1];
	if(token == null) {
		return res.sendStatus(401);
	}
	
	jwt.verify(token, process.env.SHUTTER_ACCESS_TOKEN_SECRET, (err, tk) => {
		if(err) {
			return res.sendStatus(403);
		}
		if(tk.exp < Date.now()/1000) {
			return res.sendStatus(403);
		}
		req.user = tk.user;
		
		next();
	})
  
	
  }
  module.exports.isTokenValid = (token) => {
	try {
		tk = jwt.verify(token, process.env.SHUTTER_ACCESS_TOKEN_SECRET);
		if(tk.exp < Date.now()/1000) {
			return false;
		}else {
			return tk;
		}
	}catch(err) {
		return false;
	}
}