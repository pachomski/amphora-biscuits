"use strict";

const clayLog = require("clay-log");
const pkg = require("../package.json");
let amphoraBiscuitsLogInstance;

/**
 * Initialize the logger
 */
function init() {
  if (amphoraBiscuitsLogInstance) {
    return;
  }

  // Initialize the logger
  clayLog.init({
    name: "amphora-biscuits",
    prettyPrint: true,
    meta: {
      amphoraBiscuitsVersion: pkg.version
    }
  });

  // Store the instance
  amphoraBiscuitsLogInstance = clayLog.getLogger();
}

/**
 * Setup new logger for a file
 *
 * @param  {Object} meta
 * @return {Function}
 */
function setup(meta = {}) {
  return clayLog.meta(meta, amphoraBiscuitsLogInstance);
}

// Setup on first require
init();

module.exports.init = init;
module.exports.setup = setup;
