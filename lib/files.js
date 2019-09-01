const fs = require('fs');
const glob = require('glob');
const util = require('util');

async function getFileContents(paths, encoding = 'utf-8') {
  if (typeof paths === 'string') {
    // single path
    return await util.promisify(fs.readFile)(paths, encoding);
  } else if (Array.isArray(paths)) {
    return await Promise.all(
      paths.map(async path => await getFileContents(path, 'utf-8'))
    );
  }
}

async function findPathsMatching(pathExpressions) {
  return Promise.all(
    pathExpressions.map(
      async expression => await util.promisify(glob)(expression)
    )
  );
}

module.exports.getFileContents = getFileContents;
module.exports.findPathsMatching = findPathsMatching;
