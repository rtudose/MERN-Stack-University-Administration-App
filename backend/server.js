// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const roomRoutes = require('./routes/roomRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const roomReservationRoutes = require('./routes/roomReservationRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const userRoutes = require('./routes/userRoutes');
const publicRoutes = require('./routes/publicRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const appointmentCronJobs = require('./utils/cronJobs');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully!'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

app.get('/', (req, res) => {
  res.send('Faculty Admin Platform Backend is running and connected to MongoDB!');
});

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/room-reservations', roomReservationRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/admin', adminRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

appointmentCronJobs.start();
