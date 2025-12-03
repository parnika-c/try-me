// // One-time script to recalculate totalPoints for all users based on their checkins
// import 'dotenv/config';
// import mongoose from 'mongoose';
// import User from './models/User.js';
// import Checkin from './models/Checkin.js';

// async function recalculateTotalPoints() {
//   try {
//     // Connect to MongoDB (assuming connection string is in db.js or env)
//     await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/try-me');

//     const users = await User.find({});
//     for (const user of users) {
//       const totalPointsResult = await Checkin.aggregate([
//         { $match: { userId: user._id } },
//         { $group: { _id: null, total: { $sum: '$pointsEarned' } } }
//       ]);
//       const totalPoints = totalPointsResult[0]?.total || 0;
//       await User.findByIdAndUpdate(user._id, { totalPoints });
//       console.log(`Updated ${user.firstName} ${user.lastName}: ${totalPoints} points`);
//     }

//     console.log('Recalculation complete');
//     process.exit(0);
//   } catch (error) {
//     console.error('Error recalculating points:', error);
//     process.exit(1);
//   }
// }

// recalculateTotalPoints();