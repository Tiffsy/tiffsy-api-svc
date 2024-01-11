const express = require('express')
const serverless = require('serverless-http');
const {errorHandler} = require('./middleware/errorHandler');
const dotenv = require('dotenv').config()
const bodyParser = require('body-parser');


const app = express()
const port = process.env.PORT || 5000;

//Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

//Routes
app.use("/tiffsy", require('./routes/mainRoute'));

// Error Handler Middleware
app.use(errorHandler)

app.listen(port, ()=> console.log('listening on Port 3000!'))
module.exports.handler = serverless(app)