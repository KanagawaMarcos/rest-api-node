/*
* Library for storing and editing data
*
*/

//Dependencies
const fs = require('fs');
const path = require('path');

// Container for the module (to be exported)
const lib = {};

// Base directory of the data folder
lib.base_dir = path.join(__dirname,'/../.data/');

// Write data to a file
lib.create = (dir, file, data, callback) =>{
    
    // Open the file for writing fileDescriptor
    fs.open(lib.base_dir+dir+'/'+file+'.json','wx', (err, file_descriptor)=>{
        if(!err && file_descriptor){
            // Convert data to string
            const string_data = JSON.stringify(data);

            // Write to file and close it
            fs.writeFile(file_descriptor, string_data, (err)=>{
                if(!err){
                    fs.close(file_descriptor, (err)=>{
                        if(!err){
                            callback(false);
                        }else{
                            callback('Error Closing new file');
                        }
                    });
                }else{
                    callback('Error writing to new file.');
                }
            });
        }else{
            callback('Could not create new file, it may already exist');
        }
    });


};

lib.read = (dir, file, callback)=>{
  fs.readFile(lib.base_dir+dir+'/'+file+'.json','utf8',(err, data)=>{
      callback(err,data);
  });  
};

// Update data inside a file
lib.update = (dir, file, data, callback)=>{
    // Open the file for writing
    fs.open(lib.base_dir+dir+'/'+file+'.json','r+',function(err, file_descriptor){
        if(!err && file_descriptor){

            // Convert data to string
            const string_data = JSON.stringify(data);

            // Truncate the file
            fs.truncate(file_descriptor, function(err){

                if(!err){
                
                    // Write to the file and close it
                    fs.writeFile(file_descriptor, string_data, function(err){
                        if(!err){
                            fs.close(file_descriptor, function(err){
                                if(!err){
                                    callback(false);
                                }else{
                                    callback('Error closing the file.');
                                }
                            });
                        }else{
                            callback('Error writing to existing file');
                        }
                    });
                }else{
                    callback('Error trucating file');
                }
            });
        }else{
            callback('could not ope the file for updating, it may not exist yet.');
        }
    });
};

lib.delete = (dir, file, callback)=>{
    // Unlink the file    
    fs.unlink(lib.base_dir+dir+'/'+file+'.json', (err)=>{
        if(!err){
            callback(false);
        }else{
            callback('Error deleting file.');
        }
    });
};

// Exports the module
module.exports = lib;