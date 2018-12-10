const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const root = path.resolve(__dirname, '.dynamodb');
const libFolder = path.resolve(root, 'DynamoDBLocal_lib');
const jarFile = path.resolve(root, 'DynamoDBLocal.jar');

module.exports = (port = 8000, dataPath, delayTransientStatuses) => {
  // Make sure the jar files have been downloaded
  if (!fs.existsSync(jarFile)) {
    throw new Error(`AWS DynamoDB executable is not available at ${jarFile}`);
  }

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

  const dynamoDB = spawn('java', args, {
    stdio: ['inherit', 'inherit', 'inherit'],
  });

  // Return a method to kill the spawned process
  return () => {
    dynamoDB.kill();
  };
};
