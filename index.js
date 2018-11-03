/*
* Primary file for the API
*
*/

// Dependecies
const server = require('./lib/server');
const workers = require('./lib/workers');

// Declare the app
const app = {};

// Init function
app.init = () =>{
  // Start the Server
  server.init();

  // Start the workers
  workers.init();
};

// Execute
app.init();

// Export the app
module.exports = app;
