const fs = require('fs');
const path = require('path');
const files = require('./files');
const log = require('./log').setup({ file: __filename });

const JS_PUBLIC_PATH = path.join(process.cwd(), '/public/js/');
const CSS_PUBLIC_PATH = path.join(process.cwd(), '/public/css/');

async function getCssVariations(name, styleguide) {
  const componentVariations = `${CSS_PUBLIC_PATH}${name}*`;
  const inlineFonts = `${CSS_PUBLIC_PATH}_inlined-fonts.${styleguide}.css`;

  try {
    const cssPaths = await files.findPathsMatching([
      inlineFonts,
      componentVariations
    ]);

    const cssTags = await Promise.all(
      cssPaths
        .flat()
        .map(
          async path =>
            await files.getFileContents(path, 'utf-8').then(createStyleTag)
        )
    );

    return cssTags.join('');
  } catch (err) {
    log('error', err.message, { stack: err.stack });
  }
}

async function getClientJs(name) {
  const clientJsPath = `${JS_PUBLIC_PATH}${name}.client.js`;

  if (!fs.existsSync(clientJsPath)) {
    return '';
  }

  return await getFileContents(clientJsPath, 'utf-8').then(createScriptTag);
}

function createStyleTag(contents) {
  return `<style>${contents}</style>`; // setting type="text/css" will break inline fonts
}

function createScriptTag(contents) {
  return `<script type="text/javascript">${contents}</script>`;
}

async function getScriptsAndStyles(name, styleguide) {
  try {
    const tags = await Promise.all([
      getCssVariations(name, styleguide),
      getClientJs(name)
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
