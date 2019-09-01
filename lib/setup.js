const fs = require('fs');
const glob = require('glob');
const path = require('path');
const clayHbs = require('clayhandlebars');
const {
  getComponentPath,
  getComponents,
  getLayoutPath,
  getLayouts
} = require('amphora-fs');
const { isString } = require('lodash');
const { setHbs } = require('./render');
const log = require('./log').setup({ file: __filename });

const TEMPLATE_NAME = 'template';
const hbs = clayHbs();

function hasHbsExtension(path) {
  return path.includes('.hbs') || path.includes('.handlebars');
}

function getHbsTemplatePath(itemPath) {
  const templatePaths = glob
    .sync(path.join(itemPath, `${TEMPLATE_NAME}.*`))
    .filter(hasHbsExtension);

  return templatePaths[0];
}

function getRenderableItems() {
  const components = getComponents().map(name => ({
    name,
    path: getComponentPath(name)
  }));

  const layouts = getLayouts().map(name => ({
    name,
    path: getLayoutPath(name)
  }));

  return [...components, ...layouts];
}

function registerShellTemplate() {
  const shellTemplatePath = path.resolve(__dirname, '../templates/shell.hbs');
  if (!fs.existsSync(shellTemplatePath)) {
    return;
  }

  const shellTemplateFileContents = fs.readFileSync(shellTemplatePath, 'utf-8');
  hbs.registerPartial('shell', shellTemplateFileContents);
}

function registerTemplates(items) {
  registerShellTemplate();

  items.forEach(item => {
    const templatePath = getHbsTemplatePath(item.path);
    const templateFileContents = fs.readFileSync(templatePath, 'utf8');
    hbs.registerPartial(item.name, templateFileContents);
  });
}

function compileTemplates() {
  Object.entries(hbs.partials).map(([key, value]) => {
    if (isString(value)) {
      hbs.partials[key] = hbs.compile(value, { preventIndent: true });
    }
  });

  module.exports.hbs = hbs;

  // ensure ./render.js functions have access to hbs instance/partials
  setHbs(module.exports.hbs);
}

function setup() {
  try {
    registerTemplates(getRenderableItems());
    compileTemplates();
    log('info', 'Amphora Storybook setup successful!');
  } catch (err) {
    log('error', err.message, { stack: err.stack });
  }
}

// Values assigned via functions post-instantiation
module.exports.hbs = undefined;
module.exports.envVars = undefined;

module.exports = setup;
