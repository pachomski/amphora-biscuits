const _ = require('lodash');
const path = require('path');
const files = require('./files');
const setup = require('./setup');
const log = require('./log').setup({ file: __filename });

const PUBLIC_PATH = path.join(process.cwd(), '/public');

function createStyleTag(contents) {
  return `<style>${contents}</style>`; // setting type="text/css" will break inline fonts
}

function createScriptTag(contents) {
  return `<script type="text/javascript">${contents}</script>`;
}

function prependPublicPath(string) {
  return `${PUBLIC_PATH}${string}`;
}

async function getStyleFiles(stylePaths) {
  const publicPaths = stylePaths.map(path =>
    path.includes(PUBLIC_PATH) ? path : prependPublicPath(path)
  );

  return await files.getFileContents(publicPaths, 'utf-8');
}

async function getScriptFiles(scriptPaths) {
  const publicPaths = scriptPaths.map(path =>
    path.includes(PUBLIC_PATH) ? path : prependPublicPath(path)
  );

  return await files.getFileContents(publicPaths, 'utf-8');
}

async function getScriptsAndStyles(components, locals) {
  try {
    const componentCss = _.uniq(
      components.map(name => `${PUBLIC_PATH}/css/${name}*`)
    );

    const componentJs = _.uniq(
      components.map(name => `${PUBLIC_PATH}/js/${name}*`)
    );

    const [stylePaths, scriptPaths] = await Promise.all([
      files.findPathsMatching(componentCss).then(_.flatten),
      files.findPathsMatching(componentJs).then(_.flatten)
    ]);

    const mediaMap = { styles: stylePaths, scripts: scriptPaths };

    // get js dependencies + modules for specific components from consuming app
    setup.resolveMedia(mediaMap, locals);

    const [styles, scripts] = await Promise.all([
      getStyleFiles(mediaMap.styles)
        .then(files => files.join(''))
        .then(createStyleTag),
      getScriptFiles(mediaMap.scripts)
        .then(files => files.join(''))
        .then(createScriptTag)
    ]);

    return {
      styles,
      scripts
    };
  } catch (err) {
    log('error', err.message, { stack: err.stack });
  }
}

module.exports.createStyleTag = createStyleTag;
module.exports.createScriptTag = createScriptTag;
module.exports.getScriptsAndStyles = getScriptsAndStyles;

// get all existing paths
// get all file contents for paths
