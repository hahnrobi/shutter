// External Dependancies
const mongoose = require('mongoose')

// Get Data Models
const Room = require('../models/Room')
const User = require("../models/User")

const bcrypt = require('bcryptjs');

// Get all rooms
exports.getRooms = async (req, reply) => {
  try {
    const rooms = await Room.find({"public": true})
    return rooms
  } catch (err) {
    throw boom.boomify(err)
  }
}

// Get single car by ID
exports.getSingleRoom = async (req, reply) => {
  try {
    const room = await getSingleRoom(req.params.id);
    reply.json(room);
  } catch (err) {
	  reply.statusCode = 404;
	  console.log(err);
	  reply.send({error: "There is no room with this id"});
  }
}

async function getSingleRoom(id) {
  const room = await Room.findById(id).populate("owner")
  let copyRoom = JSON.parse(JSON.stringify(room));
  delete copyRoom["auth_password"];
  delete copyRoom["approved_users"];
  delete copyRoom["owner"]["passwordHash"];
  return copyRoom;
}

// Add a new room
exports.addRoom = async (req, reply, userId) => {
  try {
    let usersRooms = await Room.find({"owner": userId});
    if(usersRooms.length < 2) {
      const room = new Room({...req.body})
	    room._id = new mongoose.Types.ObjectId();
      room.created_at = new Date();
      if(room.auth_password) {
        room.auth_password = bcrypt.hashSync(room.auth_password, 10)
      }
      let user = await User.findById(userId);
      room.owner = user;
      reply.statusCode = 200;
      const savedRoom = await room.save();
      reply.send(await getSingleRoom(savedRoom._id));
      
    } else {
      reply.statusCode = 406;
      reply.send("User reached the maximum number of permanent rooms that can be owned.");
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
      const { ...updateData } = room
      updateData.owner = checkRoom.owner;
      const update = await Room.findByIdAndUpdate(id, updateData, { new: true })
      reply.send(await getSingleRoom(req.params.id));
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
