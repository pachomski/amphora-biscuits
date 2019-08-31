const fs = require("fs");
const glob = require("glob");
const util = require("util");
const log = require("./log").setup({ file: __filename });

function asyncGlob(expression) {
  return new Promise((resolve, reject) => {
    return glob(expression, (err, matches) => {
      if (err) {
        log("error", err.message, { stack: err.stack });
        return reject(err);
      }

      return resolve(matches);
    });
  });
}

async function getFileContents(path, encoding = "utf-8") {
  return await util.promisify(fs.readFile)(path, encoding);
}

async function findPathsMatching(pathExpressions) {
  return Promise.all(
    pathExpressions.map(async expression => await asyncGlob(expression))
  );
}

module.exports.getFileContents = getFileContents;
module.exports.findPathsMatching = findPathsMatching;
