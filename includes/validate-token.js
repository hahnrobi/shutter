const jwt = require("jsonwebtoken");

function validateToken(req, res, next) {
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

module.exports = validateToken;