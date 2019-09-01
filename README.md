# Amphora Biscuits

<img src="https://desa.pl/media/img/cms/auction_objects/48844/95c5d8f1da8ff888146754748845d88c.jpg"
     alt="Teddy K"
     style="float: left; margin-right: 10px" />

A Biscuit renderer for Clay components to develop and test them in an isolated page/context.

## Install

`$ npm install --save amphora-biscuits`

## Integration

### Basic Configuration

First, ensure that you have a compatible version of Amphora installed (v3.x or greater) and require `amphora-storybook` wherever you are configuring your `amphora` renderers.

```javascript
const amphoraBiscuits = require('amphora-biscuits');
```

### Style/Script Injection

If your templates require any .css or .js files (which they most likely do), you can create a `resolveMedia()` function to retrieve the dependencies for a given resource. To use the `resolveMedia()` callback on each biscuit render, use the `amphoraStorybook.addResolveMedia` setter as shown below.

```javascript

const resolveMedia = require('../path/to/media-resolve-fn);

// Register mediaService callback with amphoraStorybook
amphoraStorybook.addResolveMedia(resolveMedia)
```

### Register Amphora Biscuits with your Amphora Instance

```javascript
return amphora({
  app: app,
  renderers: {
    html: amphoraHtml,
    default: 'html'
    biscuits: amphoraBiscuits
  },
  providers: ['apikey', amphoraProvider],
  sessionStore: redisStore,
  plugins: [amphoraSearch]
});
```

## Contributing

Want a feature or find a bug? Create an issue or a PR and someone will get on it.