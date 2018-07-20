/*
* Primary file for the API
*
*/

// Includes
const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;

// The server should respond to all requestes with a string
const server =  http.createServer(function(req,res){

  // Get the URL and parse it
  let parsedUrl = url.parse(req.url, true);

  // Get the path
  let path = parsedUrl.pathname;
  let trimmedPath = path.replace(/^\/+|\/+$/g,'');

  // Get the query string as an object
  let queryStringObject = parsedUrl.query;

  // Get the HTTP Method
  let method = req.method.toUpperCase();

  // Get the headers as an object
  let headers = req.headers;

  // Get the payload, if any
  let decoder = new StringDecoder('utf-8');
  let buffer = '';
  req.on('data', function(data){
    buffer += decoder.write(data);
  });
  req.on('end', function(){
    buffer += decoder.end();

    // Send the response
    res.end("Here's some simple response!\n");

    // Log the request path
    console.log(
      "Request received on path " + trimmedPath
      +' with this method '+ method +
      + ' using the following query string ',queryStringObject
    );
    console.log("Request received with theses headers ", headers);
    console.log("Here's the payload:", buffer);
  });
});

// Start the server, and have ir listen on port 3000
server.listen(3000, function(){
  console.log("Server listen to port 3000");
});
