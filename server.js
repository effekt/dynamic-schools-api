const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const Pool = require('pg').Pool;
const config = require('./core/config.json');
const cors = require('cors');
const morgan = require('morgan');
const AWS = require('aws-sdk');
global.config = Object.assign(process.env.ENV || config.development);
global.config['root'] = __dirname;
global.util = require('./core/util');
require('dotenv').config({ path: '../.env' })

AWS.config.update({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY
});
global.AWSS3 = new AWS.S3()

global.pool = new Pool({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PW,
    port: process.env.POSTGRES_PORT,
});
require('./core/init')();

/**
 * Configure app CORS, BodyParser, Morgan
 */
app.use(cors());
app.use(morgan('short'));
app.use(bodyParser.urlencoded({extended: false}) );
app.use(bodyParser.json());

/**
 * Route configuration in ./server/api/index
 */
require('./api')(app);

/**
 * Begin listening for requests
 */
const port = process.env.PORT || global.config.port;
app.listen(port, () => console.log(`Listening on port ${global.config.port}`));