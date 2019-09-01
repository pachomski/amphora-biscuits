const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const files = require('./files');
const log = require('./log').setup({ file: __filename });

const JS_PUBLIC_PATH = path.join(process.cwd(), '/public/js/');
const CSS_PUBLIC_PATH = path.join(process.cwd(), '/public/css/');

async function getCssVariations(components, styleguide) {
  const inlineFonts = `${CSS_PUBLIC_PATH}_inlined-fonts.${styleguide}.css`;

  try {
    const cssPaths = await files.findPathsMatching([
      inlineFonts,
      ...components.map(name => `${CSS_PUBLIC_PATH}${name}*`)
    ]);

    if (cssPaths && cssPaths.length) {
      const cssTags = await Promise.all(
        _.flatten(cssPaths).map(
          async path =>
            await files.getFileContents(path, 'utf-8').then(createStyleTag)
        )
      );

      return cssTags.join('');
    }
  } catch (err) {
    log('error', err.message, { stack: err.stack });
  }
}

// async function getClientJs(components) {
//   const clientJsPath = `${JS_PUBLIC_PATH}${components}.client.js`;

//   return await files
//     .getFileContents(clientJsPath, 'utf-8')
//     .then(createScriptTag);
// }

function createStyleTag(contents) {
  return `<style>${contents}</style>`; // setting type="text/css" will break inline fonts
}

function createScriptTag(contents) {
  return `<script type="text/javascript">${contents}</script>`;
}

async function getScriptsAndStyles(components, styleguide) {
  try {
    const tags = await Promise.all([
      getCssVariations(components, styleguide)
      // getClientJs(components)
    ]);

    return {
      styles: tags[0],
      scripts: tags[1]
    };
  } catch (err) {
    log('error', err.message, { stack: err.stack });
  }
}

module.exports.getCss = getCssVariations;
module.exports.getClientJs = getClientJs;
module.exports.createStyleTag = createStyleTag;
module.exports.createScriptTag = createScriptTag;
module.exports.getScriptsAndStyles = getScriptsAndStyles;
