require('dotenv').config();
const express = require('express');
const logger = require('./utils/logging');
const limiter = require('./middleware/rateLimiter');

const app = express();

app.use('/api', limiter); //used to limit frequent calls on an api from an IP

require('./utils/logging');
require('./startup/routes')(app);
require('./startup/db')();
// require('./startup/config')();
// require('./startup/validation')();

const port = process.env.PORT || 3000;
app.listen(port, () => {
  logger.info(`App running on port ${port}...`);
});
