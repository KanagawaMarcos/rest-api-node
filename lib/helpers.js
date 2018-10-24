 // Dependencies
const crypto = require('crypto');
const config = require('../config')

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
        const obj = JSON.parse;
        return obj;
    }
    catch(e){
        return {};
    }
}
// Export the module
module.exports = helpers;