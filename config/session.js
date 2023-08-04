require('dotenv').config();

//setup session
const sessionSecret = process.env.SESSION_SECRET;
module.exports = { sessionSecret }