#!/usr/bin/env node
const spawn = require('child_process').spawn;
const path = require('path');

const root = path.resolve(__dirname, 'aws');
const libFolder = path.resolve(root, 'DynamoDBLocal_lib');
const jarFile = path.resolve(root, 'DynamoDBLocal.jar');

module.exports = (port = 8000, dataPath, delayTransientStatuses) => {
  const args = [
    `-Djava.library.path-=${libFolder}`,
    '-jar', jarFile,
    '-sharedDb',
    '-port', port,
  ];

  if (dataPath) {
    args.push('-dbPath');
    args.push(dataPath);
  } else {
    args.push('-inMemory');
  }

  if (delayTransientStatuses) {
    args.push('-delayTransientStatuses');
  }

  const dynamoDB = spawn('java', args);

  dynamoDB.stdout.on('data', data => {
    console.log(data.toString());
  });

  dynamoDB.stderr.on('data', data => {
    // In case of an error report the error
    console.error(data.toString());
  });

  // Return a method to kill the spawned process
  return () => {
    dynamoDB.kill();
  }
};
