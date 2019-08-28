const glob = require("glob");
const path = require("path");
const {
  getComponentPath,
  getComponents,
  getLayoutPath,
  getLayouts
} = require("amphora-fs");

const STORYBOOK_NAME = "storybook";
const TEMPLATE_NAME = "template";

function isHbs(path) {
  return path.includes(".hbs") || path.includes(".handlebars");
}

function getHbsTemplate(itemPath) {
  const storyBookPaths = glob
    .sync(path.join(itemPath, `${STORYBOOK_NAME}.*`))
    .filter(isHbs);
  const templatePaths = glob
    .sync(path.join(itemPath, `${TEMPLATE_NAME}.*`))
    .filter(isHbs);
  return storyBookPaths.length ? storyBookPaths[0] : templatePaths[0];
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

function setup(data, meta, res) {
  registerTemplates(getRenderableItems());
}
//   var templateFile = getPossibleTemplates(item.path, TEMPLATE_NAME),
//   isHandlebars = _.includes(templateFile, '.handlebars') || _.includes(templateFile, '.hbs'),
//   templateFileContents,
//   modifiedTemplateFile;

// if (isHandlebars) {
//   templateFileContents = fs.readFileSync(templateFile, 'utf8');
//   // this wrapper guarantees we'll never render a component in a partial if it doesn't have a _ref
//   modifiedTemplateFile = nymagHbs.wrapPartial(item.name, templateFileContents);

//   hbs.registerPartial(item.name, modifiedTemplateFile);
// }
// });

function registerTemplates(items) {
  items.forEach(item => {
    const template = getHbsTemplate(item.path);
    console.log(template);
  });
}

module.exports = setup;
