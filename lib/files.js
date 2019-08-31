const fs = require("fs");
const glob = require("glob");
const util = require("util");
const log = require("./log").setup({ file: __filename });

async function getFileContents(path, encoding = "utf-8") {
  return await util.promisify(fs.readFile)(path, encoding);
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
