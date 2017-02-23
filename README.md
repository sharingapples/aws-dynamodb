# AWS DynamoDB Local
A simple npm package for installing Amazon's DynamoDB database locally
for testing your applications.

DynamoDB is a highly scalable noSQL database system available on Amazon
Web Services (AWS). You can read more about it from its 
[official site](https://aws.amazon.com/dynamodb/).

***Prerequisite: Java version 6 or above must be available on the system***

## Installation (Standalone)
You can install the package globally if you want to run the database server
from command line.

> `$ npm install -g aws-db`  

or

> `$ yarn global add aws-db`

Once the `aws-db` package is installed. You should be able to start the
dynamodb database server from command line.

> `$ aws-db`

### Usage
By default DynamoDB is ran on port 8000, and an in-memory database is used.
You can pass command line parameters to change the port, and use a persistent
storage for database.
> `$ aws-db 8080`  
  Runs dynamodb in port 8080

> `$ aws-db 8080 data`  
  Runs dynamodb in port 8080 with persistent storage in a folder named data
  in the current directory.

## Installation (With testing frameworks)
If you are developing your application on [nodejs](https://nodejs.org) and want 
to use dynamodb with your test frameworks like [mocha](https://mochajs.org/), you 
could install the dynamodb database in your package as a development dependency
and run the database server programmatically from within your test framework.

> `$ npm install --save-dev aws-db`

or

> `$ yarn add --dev aws-db`

Once installed on your package, you could start the dynamodb server by importing
the library
```javascript
// Your test file
const dynamoDB = require('aws-db');

// Start the dynamoDB server
const shutdownDynamoDB = dynamoDB();

...
...

// Once you are done, you can (should) shutdown the server at the end
shutdownDynamoDB();
```

### function dynamoDB(port, dbPath, delayTransitionStatuses)
The package exports a method, that is used to start the dynamodb server. The
method can be passed 3 parameters:
> **port**  
TCP port on which to run the database server. Default ***8000***.

> **dbPath**  
The location where the database server creates the database files. If this
value is omitted (or null), in-memory database is used which is not persistent.

> **delayTransitionStatuses**  
The local database server are extremely fast and don't take time for most of
the operations, which is not the case when you are using the service online on 
AWS. To simulate a similar environment, you could enable a delay on the local
database. Just pass `true` if you want to enable delays on certain functions.

Please check the [AWS documentation](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html) 
for more information on these parameters.

The `sharedDb` flag is always set.

The function returns a function that should be used to shutdown the server
at the end of the execution of your tests.

