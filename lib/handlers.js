/*
 * Request handlers
 * 
 */


//Dependencies
const _data = require('./data');
const helpers = require('./helpers');
// Define the handlers
const handlers = {};

// Users
handlers.users = (data, callback) =>{
    let acceptable_methods = ['post', 'get','put','delete'];
    
    if(acceptable_methods.includes(data.method)){
        handlers._users[data.method](data,callback);
    }else{
        callback(405);
    }
};

// Container for the users submethods
handlers._users = {};

// Users - POST
// Required data: first_name, last_name, phone, password, tos_agreement
// Optional data: none
handlers._users.post = (data,callback) =>{
    // Check that all required fields are filled out

    const first_name = false;
    // If it's a string
    if (typeof (data.payload.first_name) === 'string'){
        // And there's at least one character
        if(data.payload.first_name.trim().length > 0){
            // Then it's valid
            first_name = data.payload.first_name.trim();
        }
    }

    const last_name = false;
    // If it's a string
    if (typeof (data.payload.last_name) === 'string') {
        // And there's at least one character
        if (data.payload.last_name.trim().length > 0) {
            // Then it's valid
            last_name = data.payload.last_name.trim();
        }
    }

    const phone = false;
    // If it's a string
    is_a_string = typeof (data.payload.phone) === 'string';
    
    if (is_a_string) {

        greater_than_8  = data.payload.phone.trim().length > 8;
        smaller_than_14 = data.payload.phone.trim().length < 14;
        
        if (greater_than_8 && smaller_than_14) {
            // Then it's valid
            phone = data.payload.phone.trim();
        }
    }

    const password = false;
    // If it's a string
    is_a_string = typeof (data.payload.password) === 'string';

    if (is_a_string) {
        
        if (data.payload.password.trim().length > 0) {
            // Then it's valid
            password = data.payload.password.trim();
        }
    }

    const tos_agreement = false;
    // If it's a string
    is_a_boolean = typeof (data.payload.password) === 'boolean';

    if (is_a_boolean) {

        if (data.payload.tos_agreement === true) {
            // Then it's valid
            tos_agreement = true;
        }
    }

    if(first_name && last_name && phone && password && tos_agreement){
        // Make sure that the user doesnt already exist
        _data.read('users', phone,(err, data)=>{
            if(err){
                // Hash the password
                const hashed_password = helpers.hash(password);

                // Create the user object
                if(hashed_password){
                    const user_object = {
                        'first_name': first_name,
                        'last_name': last_name,
                        'phone': phone,
                        'hashed_password': hashed_password,
                        'tos_agreement': tos_agreement
                    };

                    _data.create('users', phone, user_object, () => {
                        if (!err) {
                            callback(200);
                        } else {
                            console.log(err);
                            callback(500, { 'Error': 'Could not create the new user ' })
                        }
                    });
                }else{
                    callback(500, 'Could not hash the password');
                }
                

            }else{
                // User already exists
                callback(400, {'Error' : 'A user with that phone number already exists'})
            }
        });
    }else{
        callback(400, {'Error ':'Missing required fields'});
    }
};

// Users - GET
handlers._users.get = (data,callback) =>{
    
}

// Users - PUT
handlers._users.put = (data,callback) =>{
    
}

// Users - delete
handlers._users.put = (data,callback) =>{
    
}

// Not found handlers
handlers.notFound = (data, callback) => callback(404);

// API alive service
handlers.ping = (data, callback) => callback(200);

//Export the module
module.exports = handlers