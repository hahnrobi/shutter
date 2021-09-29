// External Dependancies
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs');
const validator = require("email-validator");

// Get Data Models
const User = require("../models/User");

exports.getUsers = async (req, reply) => {
  try {
    const users = await User.find()
    return users
  } catch (err) {
    reply.sendStatus(400);
  }
}

// Get single car by ID
exports.getSingleUser = async (req, reply) => {
  try {
    const id = req.params.id
	reply.send(await getUser(id));
  } catch (err) {
	reply.sendStatus(403);
  }
}

async function getUser(id) {
	const user = await User.findById(id)
	if(user == null) {
		return reply.sendStatus(404);
	}
	let copyUser = JSON.parse(JSON.stringify(user));
	delete copyUser["passwordHash"];
    return copyUser;
}

exports.getSingleUserByEmail = async (email) => {
  try {
    const user = await User.findOne({email: email}).exec();
	if(user == null) {
		return reply.sendStatus(404);
	}
    return user;
  } catch (err) {
    reply.sendStatus(400);
  }
}


exports.getSingleUserPassword = async (id) => {
	try {
	  const user = await User.findById(id)
	  if(user != null && user.passwordHash != null) {
	  	return user.passwordHash;
	  }else {
		throw new Boom("Invald userid or password", {statusCode: 401});
	  }
	} catch (err) {
	  throw boom.boomify(err)
	}
  }
  

// Add a new user
exports.addUser = async (req, reply) => {
	try {
		input = {...req.body};
		const user = new User()
		user._id = new mongoose.Types.ObjectId();

		if(input.hasOwnProperty("name")) {
			user.name = input.name;
		}else {
			reply.statusCode = 400;
			return reply.send("Name required");
		}

		if(input.hasOwnProperty("email") && validator.validate(input.email)) {
			user.email = input.email;
			const emailCheck = await User.findOne({email: user.email}).exec();
			console.log(emailCheck);
			if(emailCheck != null) {
				reply.statusCode = 400;
				return reply.send("Email address already registered");
			}
		}else {
			reply.statusCode = 400;
			return reply.send("Email required");
		}


		if(input.hasOwnProperty("password")) {
			user.passwordHash = bcrypt.hashSync(input.password, 10)
		}else {
			reply.statusCode = 400;
			return reply.send("Password required");
		}


		reply.statusCode = 200;
		const savedUser = await user.save();
		reply.send(await getUser(savedUser._id));

	} catch (err) {
	  reply.send(err);
	}
  }

// Update an existing user
exports.updateUser = async (req, res, userId = undefined) => {
  try {
    const requestBody = req.body;
    if(requestBody.hasOwnProperty("email") && !validator.validate(requestBody.email)) {
		res.statusCode = 400;
      	return res.send("Invalid email format");
    }
    const user = await User.findById(req.params.id);
    if(user?._id == userId) {
      const id = user._id;
      requestBody.passwordHash = user.passwordHash;
      const { ...updateData } = requestBody;
      const update = await User.findByIdAndUpdate(id, updateData, { new: true })
	  
	  return res.send(await getUser(userId));
    }else {
	  res.send("You cannot change the details of an another user.");
	  res.statusCode = 403;
    }
  } catch (err) {
    res.send(err);
  }
}

exports.changePassword = async (req, reply, userId = undefined) => {
  try {
    const requestBody = (req.body);
    const user = await User.findById(req.params.id);
    if(user?._id == userId) {
      const id = user._id
      if(requestBody.hasOwnProperty("password") && requestBody.hasOwnProperty("oldpassword")) {
        if(bcrypt.compareSync(requestBody.oldpassword, user.passwordHash)) {
          const updateData = {"passwordHash": bcrypt.hashSync(requestBody.password, 10)};
          const update = await User.findByIdAndUpdate(id, updateData, { new: true })
		  return reply.send(await getUser(userId));
        }else {
          reply.statusCode = 400;
		  reply.send("Invalid password");
        }
      }else {
        	reply.statusCode = 400;
		  reply.send("Invalid parameters");
      }
    }else {
	  reply.statusCode = 403;
	  reply.send("You cannot change the details of an another user.");
    }
  } catch (err) {
    reply.send(err);
  }
}



