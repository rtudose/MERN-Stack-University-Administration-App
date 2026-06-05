// backend/utils/cronJobs.js
const cron = require('node-cron');
const Appointment = require('../models/Appointment');
const RoomReservation = require('../models/RoomReservation');

const updateOverdueAppointments = async () => {
  console.log('Running cron job: Updating overdue appointments...');
  const now = new Date();

  try {
    const completedResult = await Appointment.updateMany(
      {
        status: 'confirmed',
        date: { $lte: now }
      },
      [{
        $set: {
          status: {
            $cond: {
              if: {
                $lte: [
                  { $dateFromString: { dateString: { $concat: [{ $dateToString: { format: "%Y-%m-%d", date: "$date" } }, "T", "$endTime", ":00Z"] } } },
                  now
                ]
              },
              then: "completed",
              else: "$status"
            }
          }
        }
      }]
    );
    if (completedResult.modifiedCount > 0) {
        console.log(`Auto-completed ${completedResult.modifiedCount} appointments.`);
    }

    const expiredResult = await Appointment.updateMany(
      {
        status: 'pending',
        date: { $lte: now }
      },
      [{
        $set: {
          status: {
            $cond: {
              if: {
                $lte: [
                  { $dateFromString: { dateString: { $concat: [{ $dateToString: { format: "%Y-%m-%d", date: "$date" } }, "T", "$startTime", ":00Z"] } } },
                  now
                ]
              },
              then: "expired",
              else: "$status"
            }
          }
        }
      }]
    );
    if (expiredResult.modifiedCount > 0) {
        console.log(`Expired ${expiredResult.modifiedCount} pending appointments.`);
    }

  } catch (error) {
    console.error('Error running appointment update cron job:', error);
  }
};

const updateOverdueReservations = async () => {
  console.log('Running cron job: Updating overdue room reservations...');
  const now = new Date();

  try {
    await RoomReservation.updateMany(
      {
        status: 'approved',
        date: { $lte: now }
      },
      [{ $set: {
          status: {
            $cond: {
              if: {
                $lte: [ 
                  { $dateFromString: { dateString: { $concat: [{ $dateToString: { format: "%Y-%m-%d", date: "$date" } }, "T", "$endTime", ":00Z"] } } }, 
                  now 
                ] 
              }, 
              then: "completed", 
              else: "$status" 
            } 
          } 
        } 
      }]
    );
    
    await RoomReservation.updateMany(
      {
        status: 'pending',
        date: { $lte: now }
      },
      [{ $set: {
          status: {
            $cond: {
              if: {
                $lte: [ 
                  { $dateFromString: { dateString: { $concat: [{ $dateToString: { format: "%Y-%m-%d", date: "$date" } }, "T", "$startTime", ":00Z"] } } }, 
                  now 
                ] 
              }, 
              then: "expired", 
              else: "$status" 
            } 
          } 
        } 
      }]
    );

  } catch (error) {
    console.error('Error running reservation update cron job:', error);
  }
};

const start = () => {
  cron.schedule('0 * * * *', () => {
    updateOverdueAppointments();
    updateOverdueReservations();
  });
};

module.exports = { start };