const cron = require('node-cron');
const Appointment = require('../models/Appointment');

const updateOverdueAppointments = async () => {
  console.log('Running cron job: Updating overdue appointments...');
  const now = new Date();

  try {
    // 1. Find 'Confirmed' appointments where the end time is in the past and update them to 'Completed'
    const completedResult = await Appointment.updateMany(
      {
        status: 'confirmed',
        date: { $lte: now } // Check if the appointment date is today or in the past
      },
      // We must use a pipeline update to check the time within the date
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

    // 2. Find 'Pending' appointments where the start time is in the past and update them to 'Expired'
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

const start = () => {
  // Schedule the job to run every hour
  cron.schedule('0 * * * *', updateOverdueAppointments);
};

module.exports = { start };