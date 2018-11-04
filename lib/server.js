/*
* Server-related tasks
*/
// Includes
const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');
const _data = require('./data');
const handlers = require('./handlers');
const helpers = require('./helpers');
const path = require('path');
const util = require('util');
const debug = util.debuglog('server');

// Instantiate the server module
const server = {};

// Instantiate the HTTP server
server.http_server =  http.createServer((request,response) =>{
  server.requestListener(request, response);
});

// HTTPS keys
server.https_server_options = {
  'key' : fs.readFileSync(path.join(__dirname, '/../https/key.pem')),
  'cert' : fs.readFileSync(path.join(__dirname, '/../https/cert.pem'))
};

// Instantiate the HTTPS server
server.https_server =  https.createServer(server.https_server_options, (req,res) => {
  server.requestListener(req, res,);
});

// All the server logic for both the http and https server
server.requestListener = (request, response) => {

  // Get the URL and parse it
  const parsedUrl = url.parse(request.url, true);

  // Get the path
  const path = parsedUrl.pathname;
  const trimmed_path = path.replace(/^\/+|\/+$/g,'');

  // Get the query string as an object
  const query_string_object = parsedUrl.query;

  // Get the HTTP Method
  const method = request.method.toLowerCase();

  // Get the headers as an object
  const headers = request.headers;

  // Get the payload, if any
  const decoder = new StringDecoder('utf-8');
  let buffer = '';
  request.on('data', (data)=>{
    buffer += decoder.write(data);
  });

  request.on('end', ()=>{
    buffer += decoder.end();

    // Choose the handler this request should go to. If  not found, use 404
    let chosenHandler = handlers.notFound;
    if (typeof(server.router[trimmed_path]) !== 'undefined'){
       chosenHandler = server.router[trimmed_path];
    }

    // Construct the data object to send to the handler
    const data = {
      'trimmed_path' : trimmed_path,
      'query_string_object' : query_string_object,
      'method' : method,
      'headers' : headers,
      'payload' : helpers.parseJsonToObject(buffer)
    };

    // Route the request to the handler specified in the router
     chosenHandler(data, (status_code, payload) => {

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
      response.setHeader('Content-Type', 'application/json');
      response.writeHead(status_code);
      response.end(payloadString);

      // If the response is 200, print green otherwise print red
      if(status_code == 200){
        debug('\x1b[32m%s\x1b[0m',method.toUpperCase()+' /'+trimmed_path+' '+status_code);
      }else{
        debug('\x1b[31m%s\x1b[0m',method.toUpperCase()+' /'+trimmed_path+' '+status_code);
      }
    });
  });
};

// Define a request router
server.router = {
  'ping': handlers.ping,
  'users': handlers.users,
  'tokens': handlers.tokens,
  'checks' : handlers.checks
};

// Init script
server.init = () =>{
  // Start the HTTP server
  server.http_server.listen(config.http_port, () =>{
    console.log('\x1b[36m%s\x1b[0m',"HTTP: Server listen to port " + config.http_port);
  });

  // Start the HTTPS server
  server.https_server .listen(config.https_port, ()=>{
    console.log('\x1b[35m%s\x1b[0m',"HTTP: Server listen to port " + config.https_port);
  });
};

module.exports = server;
