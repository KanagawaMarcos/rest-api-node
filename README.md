# Rest API - Node.js
Rest API using plain node.js. NO DEPENDENCIES.

This API do a health check every 1 minute for some given URL. You can create an account, and every account can has 5 "checks". The project uses tokens to validate each user.

## About the project
This project is entirely made for studies propuses. It has callback hells, lot's of pre ECMA 5 constructs and no framework. The main goal here is not write a newer and clean javascript, but to feel what's like to develop in node.js in it's bare bones. 
DO NOT USE IN PRODUCTION.

## How To Run
Download Node.js from the [official  site](https://nodejs.org/en/download/) or from [here](https://github.com/creationix/nvm) (like I did), and run the following at the terminal:

```
node index.js
```
### Project Structure
 * **index.js** : Main project file, it has it initialize all the necessary files.
 * **lib/server.js**:  It has it's logic to create server http and https, routing system and the API services.
 * **lib/workers.js**: Contain background workers such as the one that make the health checks created by users or logging to files functions.
 * **lib/data.js** : Lib created in order to perform CRUD using the file system. Instead of using MongoDB, I store all of the data in a JSON file, which makes the project more straightforward to understand.
  * **lib/log.js** : Lib created in order to perform log everything that happens in the API.
  * **lib/handlers.js** : File containing all services used by the API.
  * **lib/helpers.js** : Shared functions used across the API.
  * **lib/config.js** : Configuration file for diferent environments such as production or development.
 
### Endpoints 
 - **/ping/** : 
    - Methods: **GET**
    - Description: Return a 200 status code showing that the API still alive.
    - Query Strings: none

 - **/users/** : 
    - Method: **POST**
      - Description: Create a new user.
      - Body: first_name, last_name, phone, password, tos_agreement

    - Method: **GET**
      - Description: Return a user data.
      - Query String: phone

    - Method: **UPDATE**
      - Description: Update the user's fields.
      - Body: first_name, last_name, password

    - Method: **DELETE**
      - Description: Delete a given user.
      - Query String: phone

 - **/tokens/** : 
    - Method: **POST**
      - Description: Create a new authentication token for a given user.
      - Body: phone, password
      
    - Method: **GET**
      - Description: Return a token
      - Query String: id

    - Method: **UPDATE**
      - Description: Update the token expiration time to extend one more hour.
      - Body: id, extend

    - Method: **DELETE**
      - Description: Delete a given token.
      - Query String: id
 
 - **/checks/** : 
    - Method: **POST**
      - Description: Create a new API check.
      - Body: protocol, url, method, success_codes, timeout_seconds
      
    - Method: **GET**
      - Description: Return a existing check
      - Query String: id

    - Method: **UPDATE**
      - Description: Update a check configuration
      - Body: id, protocol, url, method, success_codes, timeout_seconds

    - Method: **DELETE**
      - Description: Delete a existing check.
      - Query String: id



