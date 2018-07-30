/*
 * Request handlers
 * 
 */


//Dependencies


// Define the handlers
const handlers = {};

// Not found handlers
handlers.notFound = (data, callback) => callback(404);

// API alive service
handlers.ping = (data, callback) => callback(200);

//Export the module
module.exports = handlers