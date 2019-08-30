const fs = require("fs");
const path = require("path");
const { getFileContents } = require("./files");
const log = require("./log").setup({ file: __filename });

const JS_PUBLIC_PATH = path.join(process.cwd(), "/public/js/");
const CSS_PUBLIC_PATH = path.join(process.cwd(), "/public/css/");
// const FONTS_PUBLIC_PATH = path.join(process.cwd(), "/public/fonts/");
const CSS_SUFFIX = "._default.css";
const CLIENT_JS_SUFFIX = ".client.js";

async function getCss(name, styleguide) {
  const cssPath = `${CSS_PUBLIC_PATH}${name}${CSS_SUFFIX}`;

  if (!fs.existsSync(cssPath)) {
    return "";
  }

  return await getFileContents(cssPath, "utf-8");
}

async function getClientJs(name) {
  const clientJsPath = `${JS_PUBLIC_PATH}${name}${CLIENT_JS_SUFFIX}`;

  if (!fs.existsSync(clientJsPath)) {
    return "";
  }

  return await getFileContents(clientJsPath, "utf-8");
}

function createStyleTag(contents) {
  return `<style type="text/css">${contents}</style>`;
}

function createScriptTag(contents) {
  return `<script type="text/javascript">${contents}</script>`;
}

async function getScriptsAndStyles(name, styleguide) {
  try {
    const tags = await Promise.all([
      getCss(name, styleguide).then(createStyleTag),
      getClientJs(name).then(createScriptTag)
    ]);

    return {
      styles: tags[0],
      scripts: tags[1]
    };
  } catch (err) {
    log("error", err.message, { stack: err.stack });
  }
}

module.exports.getCss = getCss;
module.exports.getClientJs = getClientJs;
module.exports.createStyleTag = createStyleTag;
module.exports.createScriptTag = createScriptTag;
module.exports.getScriptsAndStyles = getScriptsAndStyles;
