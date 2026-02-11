const User = require('../models/User');
const Course = require('../models/Course');

const adminStats = async (req, res) => {
  const [users, courses] = await Promise.all([
    User.countDocuments(),
    Course.countDocuments()
  ]);

  const byRole = await User.aggregate([
    { $group: { _id: '$role', count: { $sum: 1 } } }
  ]);

  res.json({ users, courses, byRole });
};

const listUsers = async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json(users);
};

module.exports = { adminStats, listUsers };
