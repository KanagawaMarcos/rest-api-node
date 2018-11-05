/*
 * Request handlers
 *
 */


//Dependencies
const _data = require('./data');
const _config = require('./config');
const helpers = require('./helpers');

// Define the handlers
const handlers = {};
/*
* HTML Handlers
*/
// Index handler
handlers.index = (data,callback)=>{
  if(data.method == 'get'){
    // Read in a template as a string
    helpers.get_template('index',(err,str)=>{
      if(!err && str){
        callback(200,str,'html');
      }else{
        callback(500,undefined,'html');
      }
    });
  }else{
    callback(405,undefined,'html');
  }
};

/*
* JSON API Handlers
*/
// Tokens
handlers.tokens = (data, callback) =>{
    const acceptable_methods = ['post', 'get','put','delete'];

    if(acceptable_methods.indexOf(data.method) > -1){
        handlers._tokens[data.method](data,callback);
    }else{
        callback(405);
    }
};

// Container for all the tokens methods
handlers._tokens = {};

// Tokens - post
// Required data: phone, password
// Optional data: none
handlers._tokens.post = (data, callback) => {
    const phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length >= 8 ? data.payload.phone.trim() : false;
    const password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    if(phone && password){
        // Lookup the user who matches that phone number
        _data.read('users', phone, (err,user_data)=>{
            if(!err && user_data){
                // Hash the sent password, and compare it to the password stored in the user object
                const hashed_password = helpers.hash(password);
                if(hashed_password == user_data.hashed_password){
                    // If valid, create a new token with a random name. Set experation date to 1 hour
                    const token_id = helpers.create_random_string(_config.token_id_length);
                    const expires = _config.token_expires;
                    const token_object = {
                        'id' : token_id,
                        'phone' : phone,
                        'expires' : expires
                    };

                    // Store the token
                    _data.create('tokens', token_id, token_object, (err)=>{
                        if(!err){
                            callback(200, token_object);
                        }else{
                            callback(500, {'Error': 'Could not create the new token.'});
                        }
                    });
                }else{
                    callback(400, {'Error':'Password did not match the specified user\'s stored password'});
                }
            }else{
                callback(400, {'Error': 'Could not find the specified user.'});
            }
        });
    }else{
        callback(400, {'Error':'Missing required fields.'});
    }
};

// Tokens - get
// Rquired data: id
// Optional data: none
handlers._tokens.get =(data, callback)=> {
    // Check that the id is valid
    const id = typeof(data.query_string_object.id) == 'string' && data.query_string_object.id.trim().length == _config.token_id_length ? data.query_string_object.id.trim() : false;

    if(id){
        // Lookup the user
        _data.read('tokens',id, (err,token_data)=>{
            if(!err && token_data){
                callback(200, token_data);
            }else{
                callback(404,{'Error' : 'Token not found.'});
            }
        });
    }else{
        callback(400, {'Error':'Missing required field'})
    }
};

// Tokens - put
// Required data : id, extend
// Optional data : none
handlers._tokens.put = (data, callback)=> {
    // Check that the id is valid
    const id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length == _config.token_id_length ? data.payload.id.trim() : false;
    const extend = typeof(data.payload.extend) == 'boolean' && data.payload.extend == true ? data.payload.extend : false;

    if(id && extend){
        // Lookup the token
        _data.read('tokens', id, (err, token_data)=>{
            if(!err && token_data){
                // Check to the make sure the token isn't already expired
                if(token_data.expires > Date.now()){
                    // Set the expiration an hour from now
                    token_data.expires = _config.token_expires;
                    _data.update('tokens', id, token_data, (err)=>{
                        if(!err){
                            callback(200);
                        }else{
                            callback(500, {'Error' : 'Could not update the token\'s expiration time.'})
                        }
                    });
                }else{
                    callback(400, {'Error' : 'The token has already expired, and cannot be extended.'});
                }
            }else{
                callback(400, {'Error' : 'Specified token does not exist.'})
            }
        });
    }else{
        callback(400, {'Error':'Missing required field(s) or field(s) are invalid.'})
    }
};

// Tokens - delete
// Required data : id
// Optional data : none
handlers._tokens.delete = (data, callback) => {
    // Check that the id is valid
    const id = typeof(data.query_string_object.id) == 'string' && data.query_string_object.id.trim().length == _config.token_id_length ? data.query_string_object.id.trim() : false;

    if(id){
        // Lookup the user
        _data.read('tokens',id, (err,data)=>{
            if(!err && data){
                // Remove the hashed password from the user object before returning it.
                _data.delete('tokens', id, (err)=>{
                    if(!err){
                        callback(200);
                    }else{
                        callback(500, {'Error' : 'Could not delete the specified token'});
                    }
                });
            }else{
                callback(400, {'Error' : 'Could not find specified token.'});
            }
        });
    }else{
        callback(400, {'Error':'Missing required field'})
    }
};

// Users
handlers.users = (data, callback) =>{
    const acceptable_methods = ['post', 'get','put','delete'];

    if(acceptable_methods.indexOf(data.method) > -1){
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

    let first_name = false;
    // If it's a string
    if (typeof (data.payload.first_name) === 'string'){
        // And there's at least one character
        if(data.payload.first_name.trim().length > 0){
            // Then it's valid
            first_name = data.payload.first_name.trim();
        }
    }

    let last_name = false;
    // If it's a string
    if (typeof (data.payload.last_name) === 'string') {
        // And there's at least one character
        if (data.payload.last_name.trim().length > 0) {
            // Then it's valid
            last_name = data.payload.last_name.trim();
        }
    }

    let phone = false;
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

    let password = false;
    // If it's a string
    is_a_string = typeof (data.payload.password) === 'string';

    if (is_a_string) {

        if (data.payload.password.trim().length > 0) {
            // Then it's valid
            password = data.payload.password.trim();
        }
    }

    let tos_agreement = false;
    // If it's a string
    is_a_boolean = typeof (data.payload.tos_agreement) === 'boolean';

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
                        'tos_agreement': true
                    };

                    _data.create('users', phone, user_object, (err) => {
                        if (!err) {
                            callback(200,user_object);
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
// Required data: phone
// Optional data: none
handlers._users.get = (data,callback) =>{
    // Check that the phone number is valid
    let phone = false;
    const valid_phone_number = typeof(data.query_string_object.phone) == 'string' && data.query_string_object.phone.trim().length >= 8;

    if(valid_phone_number){
        phone = data.query_string_object.phone.trim();
    }
    if(phone){
        // Get the token from the headers
        const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

        // Verify that the given token is valid for the phone number
        handlers._tokens.verifyToken(token, phone, (token_is_valid)=>{
            if(token_is_valid){

                // Lookup the user
                _data.read('users',phone, (err,data)=>{

                    if(!err && data){
                        // Remove the hashed password from the user object before returning it.
                        delete data.hashed_password;
                        callback(200, data);
                    }else{
                        callback(404);
                    }
                });
            }else{
                callback(403, {'Error' : 'Missing required token in header, or token is invalid.'})
            }
        });

    }else{
        callback(400, {'Error':'Missing required field'})
    }
};

// Users - PUT
// Required data: phone
// Optional data: first_name, last_name, password (at least one must be specified)
handlers._users.put = (data,callback) =>{
    // Check for the required field
    let phone = false;
    const valid_phone_number = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length >= 8;

    if(valid_phone_number){
        phone = data.payload.phone.trim();
    }
    if(phone){

        let first_name = false;
        // If it's a string
        if (typeof (data.payload.first_name) === 'string'){
            // And there's at least one character
            if(data.payload.first_name.trim().length > 0){
                // Then it's valid
                first_name = data.payload.first_name.trim();
            }
        }

        let last_name = false;
        // If it's a string
        if (typeof (data.payload.last_name) === 'string') {
            // And there's at least one character
            if (data.payload.last_name.trim().length > 0) {
                // Then it's valid
                last_name = data.payload.last_name.trim();
            }
        }

        // Check for optional fields
        let password = false;
        // If it's a string
        is_a_string = typeof (data.payload.password) === 'string';

        if (is_a_string) {

            if (data.payload.password.trim().length > 0) {
                // Then it's valid
                password = data.payload.password.trim();
            }
        }

        // Error if not is sent to update
        if(first_name || last_name || password){
            // Get the token from the headers
            const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
            // Verify that the given token is valid for the phone number
            handlers._tokens.verifyToken(token, phone, (token_is_valid)=>{
                if(token_is_valid){
                    _data.read('users', phone,(err,user_data)=>{
                        if(!err && user_data){
                            // Update the fields necessary
                            if(first_name){
                                user_data.first_name = first_name;
                            }
                            if(last_name){
                                user_data.last_name = last_name;
                            }
                            if(password){
                                user_data.hashed_password = helpers.hash(password);
                            }
                            // Store the new updates
                            _data.update('users', phone,user_data,(err)=>{
                                if(!err){
                                    delete user_data.hashed_password;
                                    callback(200, user_data);
                                }else{
                                    console.log(err);
                                    callback(500,{'Error':'Could not update the user'});
                                }
                            });

                        }else{
                            callback(400, {'Error': 'Specified user does not exist'})
                        }
                    });
                }else{
                    callback(403, {'Error' : 'Missing required token in header, or token is invalid.'})
                }
            });
        }else{
            callback(400, {'Error':'Missing fields to update'})
        }

    }else{
        callback(400, {'Error':'Missing required field'})
    }
}

// Users - delete
// Required field : phone
handlers._users.delete = (data,callback) =>{
    // Check that the phone number is valid
    let phone = false;
    const valid_phone_number = typeof(data.query_string_object.phone) == 'string' && data.query_string_object.phone.trim().length >= 8;

    if(valid_phone_number){
        phone = data.query_string_object.phone.trim();
    }

    if(phone){
        // Get the token from the headers
        const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
        // Verify that the given token is valid for the phone number
        handlers._tokens.verifyToken(token, phone, (token_is_valid)=>{
            if(token_is_valid){
                // Lookup the user
                _data.read('users',phone, (err,user_data)=>{
                    if(!err && user_data){
                        // Remove the hashed password from the user object before returning it.
                        _data.delete('users', phone, (err)=>{
                            if(!err){
                                // Delete each of the checks associated with the user
                                const user_checks = typeof(user_data.checks) == 'object' && user_data.checks instanceof Array ? user_data.checks : [];
                                const checks_to_delete = user_checks.length;
                                if(checks_to_delete > 0){
                                    let checks_deleted = 0;
                                    let deletion_erros = false;
                                    // Loop throught the checks
                                    user_checks.forEach((check_id)=>{
                                        _data.delete('checks', check_id, (err)=>{
                                            if(err){
                                                deletion_erros = true;
                                            }
                                            checks_deleted++;
                                            if(checks_deleted == checks_to_delete){
                                                if(!deletion_erros){
                                                    callback(200);
                                                }else{
                                                    callback(500, {'Error': 'Errors encoutered while attempting to delete all of the user\'s checks.'})
                                                }
                                            }
                                        });
                                    });
                                }else{
                                    callback(200);
                                }
                            }else{
                                callback(500, {'Error' : 'Could not delete the specified user'});
                            }
                        });
                    }else{
                        callback(400, {'Error' : 'Could not find specified user.'});
                    }
                });
            }else{
                callback(403, {'Error' : 'Missing required token in header, or token is invalid.'})
            }
        });
    }else{
        callback(400, {'Error':'Missing required field'})
    }
}

// Verify if a given token id is currently valid for a given user
handlers._tokens.verifyToken = (id, phone, callback) =>{
    // Lookpup the token
    _data.read('tokens', id, (err, token_data)=>{
        if(!err && token_data){
            // Check that the token is for the given user and has not expired
            if(token_data.phone == phone && token_data.expires > Date.now()){
                callback(true);
            }else{
                callback(false);
            }
        }else{
            callback(false);
        }
    });
};

// Checks
handlers.checks = (data, callback) =>{
    const acceptable_methods = ['post', 'get','put','delete'];

    if(acceptable_methods.indexOf(data.method) > -1){
        handlers._checks[data.method](data,callback);
    }else{
        callback(405);
    }
};

// Container for all the checks methods
handlers._checks = {

};

// Checks - post
// Required data: protocol, url, method, success_codes, timeout_seconds
// Optional data: none
handlers._checks.post = (data, callback) =>{
    // Validate inputs
    const protocol = typeof(data.payload.protocol) == 'string' && ['https', 'http'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
    const url = typeof(data.payload.url) == 'string' && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false;
    const method = typeof(data.payload.method) == 'string' && ['post', 'get', 'put', 'delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false;
    const success_codes = typeof(data.payload.success_codes) == 'object' &&  data.payload.success_codes instanceof Array && data.payload.success_codes.length > 0 ? data.payload.success_codes : false;
    const timeout_seconds = typeof(data.payload.timeout_seconds) == 'number' && data.payload.timeout_seconds % 1 == 0 && data.payload.timeout_seconds >= 1 && data.payload.timeout_seconds <= 5 ? data.payload.timeout_seconds : false;

    if(protocol && url && method && success_codes && timeout_seconds){
        // Get the token from the headers
        const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

        // Lookup the user by reading the token
        _data.read('tokens', token, (err,token_data) =>{
            if(!err && token_data){
                const user_phone = token_data.phone;

                // Lookup the user data
                _data.read('users', user_phone, (err, user_data)=>{
                    if(!err && user_data){
                        const user_checks = typeof(user_data.checks) == 'object' && user_data.checks instanceof Array ? user_data.checks : [];
                        // Verify that the user has less than the max-checks-per-user
                        if(user_checks.length < _config.max_checks){
                            // Create a random id for the check
                            const check_id = helpers.create_random_string(20);

                            // Create the check object, and include the user's phone
                            const check_object = {
                                'id': check_id,
                                'user_phone':user_phone,
                                'protocol' : protocol,
                                'url':url,
                                'method':method,
                                'success_codes':success_codes,
                                'timeout_seconds':timeout_seconds
                            };

                            // Save the object
                            _data.create('checks',check_id, check_object, (err)=>{
                                if(!err){
                                    // Add the check id to the user's object
                                    user_data.checks = user_checks;
                                    user_data.checks.push(check_id);

                                    // Save the new user data
                                    _data.update('users', user_phone, user_data, (err) =>{
                                        if(!err){
                                            callback(200, check_object);
                                        }else{
                                            callback(500, {'Error':'Could not update the user with the new check.'});
                                        }
                                    });
                                }else{
                                    callback(500,{'Error': 'Could not create the new check.'});
                                }
                            });
                        }else{
                            callback(400, {'Error':'The user already has the maximum number of checks ('+_config.max_checks+')'})
                        }
                    }else{
                        callback(403);
                    }
                });
            }else{
                callback(403);
            }
        });
    }else{
        callback(400, {'Error': 'Missing required inputs, or inputs are invalid.'})
    }
};

// Checks - get
// Required data: id
// Optional data: none
handlers._checks.get = (data, callback) =>{
    // Check that the phone number is valid
    const id = typeof(data.query_string_object.id) == 'string' && data.query_string_object.id.trim().length == _config.token_id_length ? data.query_string_object.id.trim() : false ;

    if(id){
        // Lookup the check
        _data.read('checks', id, (err, check_data)=>{
            if(!err && check_data){
                // Get the token from the headers
                const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

                // Verify that the given token is valid for the phone number
                handlers._tokens.verifyToken(token, check_data.user_phone, (token_is_valid)=>{
                    if(token_is_valid){
                        // Return the check data
                        callback(200, check_data);
                    }else{
                        callback(403);
                    }
                });
            }else{
                callback(404);
            }
        });
    }else{
        callback(400, {'Error':'Missing required field'})
    }
};

// Checks - put
// Required data: id
// Optional data: protocol, url, method, success_codes, timeout_seconds
handlers._checks.put = (data, callback)=>{

        // Validate inputs
        const id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length == _config.token_id_length ? data.payload.id.trim() : false;
        const protocol = typeof(data.payload.protocol) == 'string' && ['https', 'http'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
        const url = typeof(data.payload.url) == 'string' && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false;
        const method = typeof(data.payload.method) == 'string' && ['post', 'get', 'put', 'delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false;
        const success_codes = typeof(data.payload.success_codes) == 'object' &&  data.payload.success_codes instanceof Array && data.payload.success_codes.length > 0 ? data.payload.success_codes : false;
        const timeout_seconds = typeof(data.payload.timeout_seconds) == 'number' && data.payload.timeout_seconds % 1 == 0 && data.payload.timeout_seconds >= 1 && data.payload.timeout_seconds <= 5 ? data.payload.timeout_seconds : false;

        // Check to make sure id is valid
        if(id){
            // Check to make sure one or more optional fields has been sent
            if(protocol || url || method || success_codes || timeout_seconds){
                _data.read('checks', id, (err, check_data)=>{
                    if(!err && check_data){
                    // Get the token from the headers
                    const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

                    // Verify that the given token is valid for the phone number
                    handlers._tokens.verifyToken(token, check_data.user_phone, (token_is_valid)=>{
                        if(token_is_valid){
                            // Update the check where necessary
                            if(protocol){
                                check_data.protocol = protocol;
                            }
                            if(url){
                                check_data.url = url;
                            }
                            if(method){
                                check_data.method = method;
                            }
                            if(success_codes){
                                check_data.success_codes = success_codes;
                            }
                            if(timeout_seconds){
                                check_data.timeout_seconds = timeout_seconds;
                            }

                            // Store the new updates
                            _data.update('checks', id, check_data, (err)=>{
                                if(!err){
                                    callback(200);
                                }else{
                                    callback(500,{'Error':'Could not update the check.'});
                                }
                            });
                        }else{
                            callback(403);
                        }
                    });
                    }else{
                        callback(400, {'Error':'Check ID does not exist.'})
                    }
                });
            }else{
                callback(400, {'Error': 'Missing fields to update.'})
            }
        }else{
            callback(400, {'Error': 'Missing required fields.'})
        }
};

// Checks - delete
// Required data: id
// Optional data: none
handlers._checks.delete = (data,callback) =>{
    // Check that the id is valid
    const id = typeof(data.query_string_object.id) == 'string' && data.query_string_object.id.trim().length == _config.token_id_length ? data.query_string_object.id.trim() : false;

    if(id){
        // Lookup the check
        _data.read('checks', id, (err, check_data)=>{
            if(!err && check_data){
                // Get the token from the headers
                const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
                // Verify that the given token is valid for the phone number
                handlers._tokens.verifyToken(token, check_data.user_phone, (token_is_valid)=>{
                    if(token_is_valid){

                        // Delete the check data
                        _data.delete('checks', id, (err)=>{
                            if(!err){
                                // Lookup the user
                                _data.read('users',check_data.user_phone, (err,user_data)=>{
                                    if(!err && user_data){
                                        const user_checks = typeof(user_data.checks) == 'object' && user_data.checks instanceof Array ? user_data.checks : [];
                                        // Remove the delete check from their list of checks
                                        const check_position = user_checks.indexOf(id);
                                        if(check_position > -1){
                                            user_checks.splice(check_position,1);
                                            // Re-save the user's data
                                            _data.update('users', check_data.user_phone,user_data, (err)=>{
                                                if(!err){
                                                    callback(200);
                                                }else{
                                                    callback(500, {'Error' : 'Could not delete the specified user'});
                                                }
                                            });
                                        }else{
                                            callback(500, {'Error': 'Could not find the check on the user object.'})
                                        }

                                    }else{
                                        callback(500, {'Error' : 'Could not find the user who created the check, thus could not delete the check.'});
                                    }
                                });
                            }else{
                                callback(500, {'Error': 'Could not delete the check data.'})
                            }
                        })
                    }else{
                        callback(403, {'Error' : 'Missing required token in header, or token is invalid.'})
                    }
                });
            }else{
                callback(400,{'Error':'The specified check ID does not exist.'})
            }
        });
    }else{
        callback(400, {'Error':'Missing required field'})
    }
}

// Not found handlers
handlers.notFound = (data, callback) => callback(404);

// API alive service
handlers.ping = (data, callback) => callback(200);

//Export the module
module.exports = handlers
