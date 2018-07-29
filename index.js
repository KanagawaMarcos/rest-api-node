/*
* Primary file for the API
*
*/

// Includes
const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');
const _data = require('./lib/data');

// testing
_data.delete('test','new_file', function(err){
  console.log('this was the error', err);
});

// Instantiate the HTTP server
const http_server =  http.createServer(function(req,res){
  unifiedServer(req, res);
});

// Start the HTTP server
http_server.listen(config.http_port, function(){
  console.log("Server listen to port ",config.http_port);
});

// Instantiate the HTTPS server
const https_server_options = {
  'key' : fs.readFileSync('./https/key.pem'),
  'cert' : fs.readFileSync('./https/cert.pem')
};
const https_server =  https.createServer(https_server_options,function(req,res){
  unifiedServer(req, res,);
});

// Start the HTTPS server
https_server.listen(config.https_port, function(){
  console.log("Server listen to port ",config.https_port);
});

// Define the handlers
const handlers = {};

// Sample handlers
handlers.sample = function (data, callback){
  // Callback a http status code, and a payload object
  callback(406, {'name' : 'sample handler'})
};

// Not found handlers
handlers.notFound = function(data, callback){
  callback(404);
};

// All the server logic for both the http and https server
const unifiedServer = function(req, res){

  // Get the URL and parse it
  const parsedUrl = url.parse(req.url, true);

  // Get the path
  const path = parsedUrl.pathname;
  const trimmed_path = path.replace(/^\/+|\/+$/g,'');

  // Get the query string as an object
  const query_string_object = parsedUrl.query;

  // Get the HTTP Method
  const method = req.method.toUpperCase();

  // Get the headers as an object
  const headers = req.headers;

  // Get the payload, if any
  const decoder = new StringDecoder('utf-8');
  let buffer = '';
  req.on('data', function(data){
    buffer += decoder.write(data);
  });

  req.on('end', function(){
    buffer += decoder.end();

    // Choose the handler this request should go to. If  not found, use 404
    let chosenHandler = handlers.notFound;
    if (typeof(router[trimmed_path]) !== 'undefined'){
       chosenHandler = router[trimmed_path];
    }

    // Construct the data object to send to the handler
    const data = {
      'trimmed_path' : trimmed_path,
      'query_string_object' : query_string_object,
      'method' : method,
      'headers' : headers,
      'payload' : buffer
    };
    // Route the request to the handler specified in the router
    chosenHandler(data, function(status_code, payload){

      // User the status code called back by the handler, or default 404
      if (typeof(status_code) !== 'number'){
          status_code = 200;
      }

      // Use the payload called back by the handler, or default to empty object
      if(typeof(payload) !== 'object'){
        payload = {};
      }

      // Convert the payload to a string
      let payloadString = JSON.stringify(payload);

      // Return the response
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(status_code);
      res.end(payloadString);

      // Log the request path
      console.log('Returning this response: ', status_code, payloadString);
    });
  });
};

handlers.ping = function(data, callback){
  callback(200);
};

// Define a request router
const router = {
  'sample' : handlers.sample,
  'ping' : handlers.ping
};
