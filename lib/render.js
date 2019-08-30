const {
  getComponentName,
  getLayoutName,
  isComponent,
  isLayout
} = require("clayutils");
const { get } = require("lodash");
const media = require("./media");
const log = require("./log").setup({ file: __filename });

let hbs;
const LOGIN_URL = "/_auth/login";

/**
 * Render the Hbs component/layout template with provided data as html
 *
 * @param  {String} partialName
 * @param  {Object} data
 * @return {String}
 */
function renderHtml(
  partialName,
  data,
  styles,
  scripts,
  opts = { useShell: false }
) {
  const itemPartial = hbs.partials[partialName](data);

  if (!itemPartial) {
    throw new Error(`Missing template for ${partialName}`);
  }

  if (opts.useShell) {
    return hbs.partials["shell"]({ partialName, data, styles, scripts });
  } else {
    return itemPartial;
  }
}

/**
 * Log the render time
 *
 * @param  {Object} hrStart
 * @param  {String} msg
 * @param  {String} route
 * @return {Function}
 */
function logTime(hrStart, msg, route) {
  const diff = process.hrtime(hrStart),
    ms = Math.floor((diff[0] * 1e9 + diff[1]) / 1000000);

  log("info", `${msg}: ${route} (${ms}ms)`, {
    renderTime: ms,
    route,
    type: "html"
  });
}

/**
 * 1. Get the HTML string
 * 2. Terminate the response
 * 3. Log the status
 *
 * @param  {Object} data
 * @param  {Object} meta
 * @param  {Object} res
 * @return {Promise}
 */

async function render(data, meta, res) {
  const hrStart = process.hrtime();
  const { site } = meta.locals;

  try {
    isLoggedIn = !!meta.locals.user;
    if (!isLoggedIn) {
      return res.redirect(LOGIN_URL);
    }

    const { _ref } = meta;
    const styleguide = get(site, "styleguide", "_default");
    const state = Object.assign(res, meta, data);

    const partialName = isComponent(_ref)
      ? getComponentName(_ref)
      : getLayoutName(_ref);

    const tags = await media.getScriptsAndStyles(partialName, styleguide);
    const html = renderHtml(partialName, state, tags.styles, tags.scripts, {
      useShell: isComponent(_ref)
    });

    res.type("text/html");
    res.send(html);
    logTime(hrStart, "rendered storybook route", res.locals.url);
    return;
  } catch (err) {
    log("error", err.message, { stack: err.stack });
    res.status(500);
    return res.send(err);
  }
}

module.exports = render;

// allow ./setup.js to initialize hbs partials and use here
module.exports.setHbs = val => (hbs = val);
