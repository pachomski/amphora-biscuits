const fs = require("fs");
const util = require("util");

async function getFileContents(path, encoding = "utf-8") {
  return await util.promisify(fs.readFile)(path, encoding);
}

module.exports.getFileContents = getFileContents;
