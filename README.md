# Amphora Biscuits
*biscuit (n): Biscuit is any pottery that has been fired in a kiln without a ceramic glaze. This can be a final product such as biscuit porcelain, or unglazed earthenware, often called terracotta, or, most commonly, an intermediary stage in a glazed final product.* 

<img src="https://desa.pl/media/img/cms/auction_objects/48844/95c5d8f1da8ff888146754748845d88c.jpg"
     alt="Teddy K"
     style="float: left; margin-right: 10px" />

A Biscuit renderer for Clay components to develop and test them in an isolated page/context.

## Install

`$ npm install --save amphora-biscuits`

## Integration

### **PRE RELEASE** Clay-Kiln installation
To get the required `clay-kiln-biscuits.js` and `clay-kiln-biscuits.css` into your build, you will need to use an extended `clay-kiln` branch found here: `https://github.com/pachomski/clay-kiln#biscuits`. You should install it in your clay node app with `npm i https://github.com/pachomski/clay-kiln#biscuits'.

### Basic Configuration

First, ensure that you have a compatible version of Amphora installed (v3.x or greater) and require `amphora-biscuits` wherever you are configuring your `amphora` renderers.

```javascript
const amphoraBiscuits = require('amphora-biscuits');
```

### Style/Script Injection

If your templates require any .css or .js files (which they most likely do), you can create a `resolveMedia()` function to retrieve the dependencies for a given resource. To use the `resolveMedia()` callback on each biscuit render, use the `amphoraBiscuits.addResolveMedia` setter as shown below.

```javascript

const resolveMedia = require('../path/to/media-resolve-fn);

/* Register mediaService callback with amphoraBiscuits */
amphoraBiscuits.addResolveMedia(resolveMedia) // Currently uses the same resolveMedia function as amphora-html
```

### resolveMedia

Will receive a mediaMap object: `{ scripts: [], styles: [] }` as well as the request `locals` object as its two arguments. This is your chance to mutate the respective `scripts` and `styles` properties as necessary for rendering + server-side processing.

#### Params

* `mediaMap` _object_
* `locals` _object_

**Returns** _undefined_


### Register Amphora Biscuits with your Amphora Instance

```javascript
return amphora({
  app: app,
  renderers: {
    html: amphoraHtml,
    default: 'html'
    biscuit: amphoraBiscuits
  },
  providers: ['apikey', amphoraProvider],
  sessionStore: redisStore,
  plugins: [amphoraSearch]
});
```

Biscuits will are now accessible at `/_components/:name/instances/instance-uri.biscuit` or `/_components/:name.biscuit`

## Contributing

Want a feature or find a bug? Create an issue or a PR and someone will get on it.
