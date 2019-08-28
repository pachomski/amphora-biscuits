const { getComponentName, isComponent, isLayout } = require("clayutils");

const LOGIN_URL = "/_auth/login";

function setup(data, meta, res) {
  const isLoggedIn = !!meta.locals.user;
  if (!isLoggedIn) {
    return res.redirect(LOGIN_URL);
  }

  const { _ref } = meta;
  let name;
  if (isComponent(_ref)) {
    name = getComponentName(_ref);
  } else if (isLayout(_ref)) {
    name = getLayoutName(_ref);
  }

  //   return res.json({ name: getComponentName(_ref) });
  return res.json(
    Object.assign({ name: getComponentName(_ref) }, data, { meta: meta })
  );
}

module.exports = setup;
