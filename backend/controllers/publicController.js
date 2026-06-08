// backend/controllers/publicController.js
const Room = require('../models/Room');

const getAvailableRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ 
      status: 'available', 
      isAvailableForExternal: true 
    }).sort({ name: 1 });
    
    res.json(rooms);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = {
  getAvailableRooms
};
