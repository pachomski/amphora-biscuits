const { render, addEnvVars } = require('./lib/render');
const { setup, addResolveMedia, addHbsHelpers } = require('./lib/setup');

setup();

module.exports.render = render;
module.exports.addEnvVars = addEnvVars;
module.exports.addResolveMedia = addResolveMedia;
module.exports.addHelpers = addHbsHelpers;
