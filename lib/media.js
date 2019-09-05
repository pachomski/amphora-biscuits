const _ = require('lodash');
const path = require('path');
const files = require('./files');
const nymagFiles = require('nymag-fs');
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

/**
 * Looks for CSS files associated with a component's variation
 *
 * @param {String} styleguide - name of the styleguide that is set in the sites config
 * @returns {string[]} variations
 */
function findVariationFiles(styleguide) {
  const stylePath = `styleguides/${styleguide}/components`,
    stylesheets = nymagFiles.getFiles(stylePath),
    variations = _.filter(stylesheets, function(file) {
      // checks for underscores which denotes variations and make sure it's a
      // css file
      return file.includes('_') && file.includes('.css');
    });

  return variations;
}

/**
 * Grabs variations of all components and returns an object organized by
 * components and their variations
 *
 * note that variations from the site's styleguide AND the _default styleguide will be added,
 * since amphora will fallback gracefully to using the _default css files if they don't
 * exist in the site's styleguide
 *
 * @param {String} [styleguide] - name of the styleguide that is set in the sites' config
 * @returns {Object} componentVariations - an object that is organized by
 * component and its variations
 */
function getCssVariations(styleguide = '_default') {
  const foundVariations =
      styleguide !== '_default'
        ? _.uniq(
            findVariationFiles(styleguide).concat(
              findVariationFiles('_default')
            )
          )
        : findVariationFiles('_default'),
    componentVariations = {};

  if (foundVariations.length) {
    _.forEach(foundVariations, function(variant) {
      let component = variant.split('_')[0],
        variantName = path.basename(variant, '.css');

      (
        componentVariations[component] || (componentVariations[component] = [])
      ).push(variantName);
    });
  }
  return componentVariations;
}

async function getStyleFiles(stylePaths) {
  const publicPaths = stylePaths.map(path =>
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

    // get component specific css and client.js files
    const [stylePaths, scriptPaths] = await Promise.all([
      files.findPathsMatching(componentCss).then(_.flatten),
      files.findPathsMatching(componentJs).then(_.flatten)
    ]);

    const mediaMap = { styles: stylePaths, scripts: scriptPaths };

    // get js + css dependencies + modules for specific components from consuming app
    setup.resolveMedia(mediaMap, locals);

    return {
      styles: await getStyleFiles(mediaMap.styles)
        .then(files => files.join(''))
        .then(createStyleTag),
      scripts: mediaMap.scripts
    };
  } catch (err) {
    log('error', err.message, { stack: err.stack });
  }
}

module.exports.createStyleTag = createStyleTag;
module.exports.createScriptTag = createScriptTag;
module.exports.getScriptsAndStyles = getScriptsAndStyles;
module.exports.getCssVariations = getCssVariations;
