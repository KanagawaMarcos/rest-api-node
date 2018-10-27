/*
 * Create and export configuration variables
 *
 */
// Heroku PORT
const PORT = process.env.PORT || 5000;

// Container for all the environments
let environments = {};

// Staging (default) environment
environments.staging = {
  'http_port' : 8000,
  'https_port' : 8100,
  'envName' : 'staging',
  'hashing_secret' : 'this_is_a_secret'
};

// Production environment
environments.production = {
  'http_port' : PORT,//'http_port' : 5000,
  'https_port' : PORT, //'https_port' : 5001,
  'env_name' : 'production',
  'hashing_secret': 'this_is_also_a_secret'
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
