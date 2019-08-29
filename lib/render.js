const {
  getComponentName,
  getLayoutName,
  isComponent,
  isLayout
} = require("clayutils");
const log = require("./log").setup({ file: __filename });

let hbs;
const LOGIN_URL = "/_auth/login";

function renderHtml(partialKey, data) {
  rootPartial = hbs.partials[partialKey];

  if (!rootPartial) {
    throw new Error(`Missing template for ${template}`);
  }

  return rootPartial(data);
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

function render(data, meta, res) {
  const hrStart = process.hrtime();

  const isLoggedIn = !!meta.locals.user;
  if (!isLoggedIn) {
    return res.redirect(LOGIN_URL);
  }

  let name;
  const { _ref } = meta;
  if (isComponent(_ref)) {
    name = getComponentName(_ref);
  } else if (isLayout(_ref)) {
    name = getLayoutName(_ref);
  }

  const html = renderHtml(name, data);
  res.type("text/html");
  res.send(html);
  logTime(hrStart, "rendered storybook route", res.locals.url);
}

module.exports = render;
module.exports.setHbs = val => (hbs = val);