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
        for (i = 1; i < str_length; i++){
            // Get random character from the possible characters string
            const random_character = possible_characters.charAt(Math.floor(Math.random() * possible_characters.length));
            
            // Append this character to the final string
            random_string += random_character;
        }

        return random_string;
    }else{
        return false;
    }
}
// Export the module
module.exports = helpers;