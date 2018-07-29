# Rest API - Node.js
Rest API using plain node.js. NO DEPENDENCIES.

## How To Run
Download Node.js from the [official  site](https://nodejs.org/en/download/) or from [here](https://github.com/creationix/nvm) (like I did), and run the following at the terminal:

```
node index.js
```
### Project Structure
 * **index.js** : Main project file, it has it's business logic, create server http and https, routing system and services.
 * **data.js** : Lib created in order to perform CRUD using the file system. Instead of using MongoDB, I store all of the data in a JSON file, which makes the project more easy to use.