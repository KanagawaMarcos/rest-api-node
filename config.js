/*
 * Create and export configuration variables
 *
 */
// Heroku PORT
const PORT = process.env.PORT || 5000;
const TOKEN_LENGTH = 20;
const TOKEN_EXPIRES = Date.now() + 1000 * 60* 60; // 1 second * 60 * 60 = 1 hour

// Container for all the environments
let environments = {};

// Staging (default) environment
environments.staging = {
  'http_port' : 8000,
  'https_port' : 8100,
  'envName' : 'staging',
  'hashing_secret' : 'this_is_a_secret',
  'token_id_length' : TOKEN_LENGTH,
  'token_expires': TOKEN_EXPIRES,
  'max_checks' : 5,
  'twilio' : {
    'accountSid' : 'ACb32d411ad7fe886aac54c665d25e5c5d',
    'authToken' : '9455e3eb3109edc12e3d8c92768f7a67',
  'fromPhone' : '+15005550006'
  }
};

// Production environment
environments.production = {
  'http_port' : PORT,//'http_port' : 5000,
  'https_port' : 5001, //'https_port' : 5001,
  'env_name' : 'production',
  'hashing_secret': 'this_is_also_a_secret',
  'token_id_length' : TOKEN_LENGTH,
  'token_expires': TOKEN_EXPIRES,
  'max_checks' : 5,
  'twilio' : {
    'accountSid' : 'ACb32d411ad7fe886aac54c665d25e5c5d',
    'authToken' : '9455e3eb3109edc12e3d8c92768f7a67',
  'fromPhone' : '+15005550006'
  }

};

// Determine which environment was passed as a command-line argument
let current_enviroment = '';
if (typeof(process.env.NODE_ENV) == 'string'){
  current_enviroment = process.env.NODE_ENV.toLowerCase();
}

// Set the passed environment or the default
//let environment_to_export = environments.staging;
let environment_to_export = environments.production;
if(typeof(environments[current_enviroment]) == 'object'){
  environment_to_export = environments[current_enviroment];
}

// Export the module
module.exports = environment_to_export;
