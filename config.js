/*
 * Create and export configuration variables
 *
 */

// Container for all the environments
let environments = {};

// Staging (default) environment
environments.staging = {
  'port' : 3000,
  'envName' : 'staging'
};

// Production environment
environments.production = {
  'port' : 5000,
  'envName' : 'production'
};

// Determine which environment was passed as a command-line argument
let current_enviroment = '';
if (typeof(process.env.NODE_ENV) == 'string'){
  current_enviroment = process.env.NODE_ENV.toLowerCase();
}

// Set the passed environment or the default
let environment_to_export = environments.staging;
if(typeof(environments[current_enviroment]) == 'object'){
  environment_to_export = environments[current_enviroment];
}

// Export the module
module.exports = environment_to_export;
