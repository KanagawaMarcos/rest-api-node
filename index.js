/*
* Primary file for the API
*
*/

// Includes
const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');

// The server should respond to all requestes with a string
const server =  http.createServer(function(req,res){

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
});

// Start the server, and have ir listen on port 3000
server.listen(config.port, function(){
  console.log("Server listen to port "+config.port+
              " in the environment "+ config.envName
  );
});

// Define the handlers
let handlers = {};

// Sample handlers
handlers.sample = function (data, callback){
  // Callback a http status code, and a payload object
  callback(406, {'name' : 'sample handler'})
};

// Not found handlers
handlers.notFound = function(data, callback){
  callback(404);
};

// Define a request router
let router = {
  'sample' : handlers.sample
};
