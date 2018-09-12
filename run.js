#!/usr/bin/env node
const process = require('process');
const path = require('path');

const dynamoDB = require('./index');

const port = process.argv[2] || 8000;
const dataPath = process.argv[3] ? path.resolve(process.cwd(), process.argv[3]) : null;

if (port === '-h' || port === '--help') {
  console.log('usage: aws-dynamodb [<port> [<dataPath>]]');
  console.log();
  console.log('  port:        TCP port on which the database server is run (default: 8000)');
  console.log('  dataPath:    The location where the database files are stored');
  console.log('               If not provided, in-memory database is used');
} else {
  // Run dynamoDB
  dynamoDB(port, dataPath);
}
