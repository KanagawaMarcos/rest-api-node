 // Dependencies
const crypto = require('crypto');
const config = require('./config')
const https = require('https');
const querystring = require('querystring');
const path = require('path');
const fs = require('fs');

// Container for all the helpers
const helpers = {};

// Create a SHA256 hash
helpers.hash = (str) =>{
    if(typeof(str) == 'string' && str.length > 0){
        const hash = crypto.createHmac('sha256', config.hashing_secret).update(str).digest('hex');
        return hash;
    }else{
        return false;
    }
};

// Parse a JSON string to an object in all cases, without throwing
helpers.parseJsonToObject = (str) =>{
    try {
        const obj = JSON.parse(str);
        return obj;
    }
    catch(e){
        return {};
    }
}

// Create a string of random alphanumeric character, of a given length
helpers.create_random_string = (str_length) =>{
    str_length = typeof(str_length) == 'number' && str_length > 0 ? str_length : false;
    if(str_length){
        // Define all the possible character that could go into a string
        const possible_characters = 'abcdefghijklmnopqrstuvwxyz0123456789';

        // Start the final string
        let random_string = '';
        for (i = 1; i <= str_length; i++){
            // Get random character from the possible characters string
            const random_character = possible_characters.charAt(Math.floor(Math.random() * possible_characters.length));

            // Append this character to the final string
            random_string += random_character;
        }

        return random_string;
    }else{
        return false;
    }
};

helpers.send_twilio_sms = (phone,msg, callback)=>{
    // Validate parameters
    phone = typeof(phone) == 'string' && phone.trim().length == 10 ? phone.trim() : false;
    msg = typeof(msg) == 'string' && msg.trim().length > 0 && msg.trim().length <= 1600 ? msg.trim() : false;
    if(phone && msg){

        // Configure the request payload
        var payload = {
        'From' : config.twilio.fromPhone,
        'To' : '+1'+phone,
        'Body' : msg
        };
        var stringPayload = querystring.stringify(payload);


        // Configure the request details
        var requestDetails = {
        'protocol' : 'https:',
        'hostname' : 'api.twilio.com',
        'method' : 'POST',
        'path' : '/2010-04-01/Accounts/'+config.twilio.accountSid+'/Messages.json',
        'auth' : config.twilio.accountSid+':'+config.twilio.authToken,
        'headers' : {
            'Content-Type' : 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(stringPayload)
        }
        };

        // Instantiate the request object
        var req = https.request(requestDetails,function(res){
            // Grab the status of the sent request
            var status =  res.statusCode;
            // Callback successfully if the request went through
            if(status == 200 || status == 201){
            callback(false);
            } else {
            callback('Status code returned was '+status);
            }
        });

        // Bind to the error event so it doesn't get thrown
        req.on('error',function(e){
        callback(e);
        });

        // Add the payload
        req.write(stringPayload);

        // End the request
        req.end();

    } else {
        callback('Given parameters were missing or invalid');
    }
};

// Get the string content of a template
helpers.get_template = (template_name,callback)=>{
  template_name = typeof(template_name) == 'string' && template_name.length > 0 ? template_name : false;
  if(template_name){
    let templates_dir = path.join(__dirname,'/../templates/')+template_name + '.html';
    fs.readFile(templates_dir,'utf8',(err,str)=>{
      if(!err && str && str.length > 0){
        callback(false,str);
      }else{
        callback('No template could be found.');
      }
    });
  }else{
    callback('A valid template name was not specified');
  }
};

// Export the module
module.exports = helpers;
