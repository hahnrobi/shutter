// External Dependancies
const mongoose = require('mongoose')

// Get Data Models
const Room = require('../models/Room')
const User = require("../models/User")

const bcrypt = require('bcryptjs');

// Get all rooms
exports.getRooms = async (req, reply) => {
  try {
    const rooms = await Room.find({"public": true}).populate("owner");
    copyRooms = JSON.parse(JSON.stringify(rooms));
    console.log(copyRooms);
    copyRooms.forEach(room => {
      delete room["auth_password"];
      delete room.approved_users;
      delete room.owner.passwordHash;
      delete room["owner"]["email"];
    })
    return copyRooms
  } catch (err) {
    throw (err)
  }
}

//Get all rooms owned by user
exports.getRoomsForUser = async (req, reply, userId) => {
  try {
    const rooms = await Room.find({"owner": userId})
    if(rooms.length > 0) {
      rooms.forEach(r => {
        if(r.auth_password != undefined) {
          r.auth_password = "";
        }
      })
      reply.send(rooms);
    }else {
      reply.sendStatus(404);
    }
  } catch (err) {
    throw boom.boomify(err)
  }
}

// Get single car by ID
exports.getSingleRoom = async (req, reply) => {
  try {
    const room = await this.getSingleRoomFromDb(req.params.id);
    reply.json(room);
  } catch (err) {
	  reply.statusCode = 404;
	  console.log(err);
	  reply.send({error: "There is no room with this id"});
  }
}

exports.getSingleRoomFromDb = async(id, complete = false) => {
  const room = await Room.findById(id).populate("owner")
  let copyRoom = JSON.parse(JSON.stringify(room));
  if(!complete) {
    delete copyRoom["auth_password"];
    delete copyRoom["approved_users"];
    delete copyRoom["owner"]["passwordHash"];
  }
  return copyRoom;
}

// Add a new room
exports.addRoom = async (req, reply, userId) => {
  try {
    let usersRooms = await Room.find({"owner": userId});
    if(usersRooms.length < 3) {
      delete req.body._id;
      const room = new Room({...req.body})
	    room._id = new mongoose.Types.ObjectId();
      room.created_at = Date.now();
      if(room.auth_password) {
        room.auth_password = bcrypt.hashSync(room.auth_password, 10)
      }
      let user = await User.findById(userId);
      room.owner = user;
      reply.statusCode = 200;
      const savedRoom = await room.save();
      reply.send(await this.getSingleRoomFromDb(savedRoom._id));
      
    } else {
      reply.statusCode = 406;
      reply.send("You have reached the maximum number of permanent rooms that can be owned.");
    }
  } catch (err) {
    reply.send(err);
  }
}

// Update an existing room
exports.updateRoom = async (req, reply, userId = undefined) => {
  try {
    const reqestBody = req.body;
    const checkRoom = await Room.findById(req.params.id);
    if(await isRoomOwnedByUser(req.params.id, userId)) {
      const id = checkRoom._id
      const room = reqestBody
      if(room.name == undefined || room.name.length < 3) {
        reply.statusCode = 400;
        return reply.send("Room name has to be at least 3 characters long.");
      }
      if(room.auth_type == "password" && (room.auth_password == undefined || room.auth_password.length < 5)) {
        reply.statusCode = 400;
        return reply.send("Password should be at least 5 characters long.");
      }
      const { ...updateData } = room
      updateData.owner = checkRoom.owner;
      const update = await Room.findByIdAndUpdate(id, updateData, { new: true })
      reply.send(await this.getSingleRoomFromDb(req.params.id));
    }else {
      reply.statusCode = 403;
      reply.send("Room is not owned by the user.");
    }
  } catch (err) {
    reply.send(err);
  }
}

// Delete a room
exports.deleteRoom = async (req, reply, userId = undefined) => {
  try {
    const checkRoom = await Room.findById(req.params.id);
    if(await isRoomOwnedByUser(req.params.id, userId)) {
      const id = req.params.id
      const room = await Room.findByIdAndRemove(id)
      reply.send(room);
    }else {
      reply.statusCode = 403;
      reply.send("Room is not owned by the user.");
    }
  } catch (err) {
    reply.statusCode = 406;
    reply.send(err || "Error");
  }
}

async function isRoomOwnedByUser(roomId, userId) {
  const checkRoom = await Room.findById(roomId);
  if(checkRoom.owner?._id == userId) {
    return true
  }
  return false;
}

exports.approveUserToRoom = async (roomId, userId) => {
  const room = await Room.findById(roomId);
  const user = await User.findById(userId);
  if(room && user) {
    room.approved_users.push(user);
    room.save();
    return true;
  }
  return false;
}
exports.isUserApprovedToRoom = async(roomId, userId) => {
  const room = await Room.findById(roomId);
  const user = await User.findById(userId);
  let approved = false;
  if(room && user) {
    room.approved_users.forEach(element => {
      if(element == userId) {
        approved = true;
      }
    });
  }
  return approved;
}
