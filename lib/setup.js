const _ = require('lodash');
const fs = require('fs');
const glob = require('glob');
const path = require('path');
const yaml = require('js-yaml');
const clayHbs = require('clayhandlebars');
const {
  getComponentPath,
  getComponents,
  getLayoutPath,
  getLayouts
} = require('amphora-fs');
const render = require('./render');
const { findPathsMatching, getFileContents } = require('./files');
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

  return components
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

    if (templatePath) {
      const templateFileContents = fs.readFileSync(templatePath, 'utf8');
      hbs.registerPartial(item.name, templateFileContents);
    }
  });
}

function compileTemplates() {
  Object.entries(hbs.partials).map(([key, value]) => {
    if (_.isString(value)) {
      hbs.partials[key] = hbs.compile(value, { preventIndent: true });
    }
  });

  module.exports.hbs = hbs;

  // ensure ./render.js functions have access to hbs instance/partials
  render.setHbs(module.exports.hbs);
}

async function registerBiscuits() {
  const components = getComponents();
  const biscuits = {};

  try {
    const paths = await Promise.all(
      components.map(async componentName => {
        const componentPath = getComponentPath(componentName);
        const biscuitPath = await findPathsMatching([
          `${componentPath}/biscuits.yml`
        ]).then(_.flatten);
        const biscuitFileContents = await getFileContents(biscuitPath);
        biscuits[componentName] = yaml.safeLoad(biscuitFileContents);
      })
    );

    module.exports.biscuits = biscuits;
  } catch (err) {
    log('error', err.message, { stack: err.stack });
  }
}

function addResolveMedia(fn) {
  if (typeof fn === 'function') {
    module.exports.resolveMedia = fn;
  } else {
    log('error', 'The provided value for resolveMedia is not a function');
  }
}

function addHbsHelpers(helpers) {
  Object.entries(helpers).map(([helperName, helperFn]) => {
    hbs.registerHelper(helperName, helperFn);
  });
}

function setup() {
  try {
    registerBiscuits();
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
module.exports.resolveMedia = undefined;
module.exports.biscuits = undefined;

module.exports.setup = setup;
module.exports.addResolveMedia = addResolveMedia;
module.exports.addHbsHelpers = addHbsHelpers;
