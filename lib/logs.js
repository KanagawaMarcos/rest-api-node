// Library for storing and rotatin logs
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Container for the module
const lib = {};

// Base directory of the logs folder
lib.base_dir = path.join(__dirname, '/../.logs/');

// Append a string to a file. Create the file if it does not exist.
lib.append = (file,str, callback) =>{
  // Open the file for appending
  fs.open(lib.base_dir+file+'.log','a',(err,file_descriptor)=>{
    if(!err && file_descriptor){
      fs.appendFile(file_descriptor,str+'\n',(err)=>{
        if(!err){
          fs.close(file_descriptor, (err)=>{
            if(!err){
              callback(false);
            }else {
              callback('Error closing file that was being appended.');
            }
          });
        }else{
          callback('Error appending to file.');
        }
      });
    }else{
      callback('Could not open file for appending.');
    }
  });
};

// List all the logs, and optionally include the compressed logs
lib.list =  (include_compressed_logs, callback) =>{
  fs.readdir(lib.base_dir,(err,data)=>{
    if(!err && data && data.length > 0){

      const trimmed_file_names = data.filter((file_name)=>{
        // Has .log extension
        return file_name.indexOf('.log') > -1 || ( include_compressed_logs && file_name.indexOf('.gz.b64') > -1);
      }).map((file_name)=>{
        if(file_name.indexOf('.log') > -1){
          // Remove .log extension
          return file_name.replace('.log','');
        }

        // Add on the .gz files
        if(file_name.indexOf('.gz.b64') > -1 && include_compressed_logs){
          return file_name.replace('.gz.b64','')
        }
      });

      callback(false, trimmed_file_names);
    }else{
      callback(err,data);
    }
  });
};

// Compress the contents of one .log file into a .gz.b64 file whitin the same directory
lib.compress = (log_id, new_file_id, callback)=>{
  const source_file = log_id + '.log';
  const dest_file = new_file_id + '.gz.b64';

  // Read the source file
  fs.readFile(lib.base_dir+source_file,'utf8',(err,input_string)=>{
    if(!err && input_string){
      // Compress the data using gzip
      zlib.gzip(input_string, (err,buffer)=>{
        if(!err && buffer){
          // Send the data to the destination file
          fs.open(lib.base_dir+dest_file,'wx',(err,file_descriptor)=>{
            if(!err && file_descriptor){
              // Write to the destination file
              fs.writeFile(file_descriptor,buffer.toString('base64'),(err)=>{
                if(!err){
                  // Close the destination file
                  fs.close(file_descriptor, (err)=>{
                    if(!err){
                      callback(false);
                    }else{
                      callback(err);
                    }
                  });
                }else{
                  callback(err);
                }
              });
            }else{
              callback(err);
            }
          });
        }else{
          callback(err);
        }
      });
    }else{
      callback(err);
    }
  });
};

// Decompress the contents of a .gz.b64 file into a string variable
lib.decompress = (file_id, callback)=>{
  const file_name = file_id+'.gz.b64';
  fs.readFile(lib.base_dir+file_name,'utf8',(err,str)=>{
    if(!err && str){
      // Decompress the data
      const input_buffer = Buffer.from(str,'base64');
      zlib.unzip(input_buffer,(err,output_buffer)=>{
        if(!err && output_buffer){
           // callback
           const str = output_buffer.toString();
           callback(false, str);
        }else{
          callback(err);
        }
      });
    }else{
      callback(err);
    }
  });
};

// Truncate a log file
lib.truncate = (log_id, callback)=>{
  fs.truncate(lib.base_dir+log_id+'.log',0,(err)=>{
    if(!err){
      callback(false);
    }else{
      callback(err);
    }
  });
};
module.exports = lib;
