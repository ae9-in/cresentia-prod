const crypto = require('crypto');

const createVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

module.exports = { createVerificationToken };
