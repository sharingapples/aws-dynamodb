#!/usr/bin/env node
const os = require('os');
const path = require('path');
const https = require('https');
const fs = require('fs');
const targz = require('targz');
const shajs = require('sha.js');

function getSha256() {
  return new Promise((resolve, reject) => {
    const req = https.get('https://s3-us-west-2.amazonaws.com/dynamodb-local/dynamodb_local_latest.tar.gz.sha256', (resp) => {
      if (resp.statusCode !== 200) {
        reject(new Error(`Server responded with error code ${resp.statusCode}`));
        return;
      }

      resp.on('data', (d) => {
        resolve(d.toString().split(' ')[0]);
      });

      resp.on('error', (err) => {
        reject(err);
      });
    });

    if (req.on('error', (err) => {
      reject(err);
    }));
  });
}

function download() {
  // Use a temporary file to create while downloading
  const targetFile = path.resolve(os.tmpdir(), 'dynamodb.tar.gz');
  // First retrieve the sha256 sum
  const cache = getSha256().then(sha => new Promise((resolve) => {
    // If we have an existing file, see if the sha match
    if (fs.existsSync(targetFile)) {
      const sha256 = shajs('sha256');
      const inp = fs.createReadStream(targetFile);
      inp.on('data', (chunk) => {
        sha256.update(chunk);
      });
      inp.on('end', () => {
        if (sha256.digest('hex') === sha) {
          resolve(true);
        } else {
          resolve(sha);
        }
      });
    } else {
      resolve(sha);
    }
  }));

  // Get the archive file
  const archive = cache.then((isCached) => {
    // isCached could be a shasum
    if (isCached === true) {
      return targetFile;
    }

    return new Promise((resolve, reject) => {
      // Download the file
      const file = fs.createWriteStream(targetFile);
      https.get('https://s3-us-west-2.amazonaws.com/dynamodb-local/dynamodb_local_latest.tar.gz', (resp) => {
        if (resp.statusCode !== 200) {
          reject(new Error(`Server responded with ${resp.statusCode}`));
          return;
        }

        const contentLength = resp.headers['content-length'];
        let total = 0;
        resp.pipe(file);

        process.stdout.write(`Downloading ${Math.round(contentLength / 1024 / 1024, 1)}MB ...0`);
        let progress = 5;
        resp.on('data', (d) => {
          total += d.length;
          const p = Math.floor((total / contentLength) * 100);
          if (p >= progress) {
            process.stdout.write(`...${p}`);
            progress += 5;
          }
        });
        resp.on('end', () => {
          process.stdout.write('\n');
          resolve(targetFile);
        });

        resp.on('error', (err) => {
          process.stdout.write('...Failed\n');
          reject(err);
        });
      });
    });
  });

  archive.then(() => new Promise((resolve, reject) => {
    process.stdout.write('Extracting binaries.\n');
    targz.decompress({
      src: targetFile,
      dest: path.resolve(__dirname, '.dynamodb'),
    }, (err) => {
      if (err) {
        return reject(err);
      }

      return resolve(true);
    });
  }));

  return archive;
}

download();
