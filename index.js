const { render, addEnvVars } = require('./lib/render');
const setup = require('./lib/setup');

setup();

module.exports.render = render;
module.exports.addEnvVars = addEnvVars;
