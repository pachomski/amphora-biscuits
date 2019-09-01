const { getIndices, getLayoutPath, getSchemaPath } = require('amphora-fs');
const { isComponent, getLayoutName, getComponentName } = require('clayutils');
const _ = require('lodash');
const media = require('./media');
const log = require('./log').setup({ file: __filename });

let hbs;
let envVars;
const LOGIN_URL = '/_auth/login';

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
  if (typeof hbs.partials[partialName] !== 'function') {
    throw new Error(
      `Hbs template with name, "${partialName}" does not seem to registered.`
    );
  }

  const itemPartial = hbs.partials[partialName](data);

  if (opts.useShell) {
    return hbs.partials['shell']({ partialName, data, styles, scripts });
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

  log('info', `${msg}: ${route} (${ms}ms)`, {
    renderTime: ms,
    route,
    type: 'html'
  });
}

function makeState(data, meta) {
  const indices = getIndices(meta._layoutRef || meta._ref, data);
  const components = _.get(indices, 'components', []);
  const layoutRef = _.get(meta, '_layoutRef', '');
  const layoutName = getLayoutName(layoutRef) || '';

  return Object.assign(
    {
      _ref: meta._ref,
      _components: components,
      _envVars: envVars,
      _layout: {
        name: layoutName,
        _ref: layoutRef,
        _schema: layoutName ? getSchemaPath(getLayoutPath(layoutName)) : {}
      }
    },
    data
  );
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

  try {
    isLoggedIn = !!meta.locals.user;
    if (!isLoggedIn) {
      return res.redirect(LOGIN_URL);
    }

    const _ref = _.get(meta, '_ref', '');
    const site = _.get(meta, 'locals.site', '');
    const styleguide = _.get(site, 'styleguide', '_default');
    const state = makeState(data, meta);

    const partialName = isComponent(_ref)
      ? getComponentName(_ref)
      : getLayoutName(_ref);

    const tags = await media.getScriptsAndStyles(state._components, res.locals);
    const html = renderHtml(partialName, state, tags.styles, tags.scripts, {
      useShell: isComponent(_ref)
    });

    res.type('text/html');
    res.send(html);
    logTime(hrStart, 'rendered storybook route', res.locals.url);
    return;
  } catch (err) {
    log('error', err.message, { stack: err.stack });
    res.status(500);
    return res.send(err);
  }
}

module.exports.render = render;

// allow ./setup.js to initialize hbs partials and use here
module.exports.setHbs = val => (hbs = val);
module.exports.addEnvVars = vars => (envVars = vars);
