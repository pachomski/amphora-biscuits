"use strict";

const clayLog = require("clay-log");
const pkg = require("../package.json");
let amphoraStorybookLogInstance;

/**
 * Initialize the logger
 */
function init() {
  if (amphoraStorybookLogInstance) {
    return;
  }

  // Initialize the logger
  clayLog.init({
    name: "amphora-storybook",
    prettyPrint: true,
    meta: {
      amphoraStorybookVersion: pkg.version
    }
  });

  // Store the instance
  amphoraStorybookLogInstance = clayLog.getLogger();
}

/**
 * Setup new logger for a file
 *
 * @param  {Object} meta
 * @return {Function}
 */
function setup(meta = {}) {
  return clayLog.meta(meta, amphoraStorybookLogInstance);
}

// Setup on first require
init();

module.exports.init = init;
module.exports.setup = setup;
