const bcrypt = require('bcryptjs');

async function hashValue(value) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(value, salt);
}

async function compareHash(value, hash) {
  return bcrypt.compare(value, hash);
}

module.exports = { hashValue, compareHash };
