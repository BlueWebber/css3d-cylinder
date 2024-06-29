# css3d-cylinder

[![GitHub license](https://img.shields.io/badge/license-ISC-blue.svg)](https://github.com/BlueWebber/css3d-cylinder/blob/main/LICENSE) [![npm version](https://img.shields.io/npm/v/css3d-cylinder.svg?style=flat)](https://www.npmjs.com/package/css3d-cylinder) [![minified size](https://img.shields.io/bundlephobia/min/css3d-cylinder) ](https://bundlephobia.com/result?p=css3d-cylinder)[![minzipped size](https://img.shields.io/bundlephobia/minzip/css3d-cylinder) ](https://bundlephobia.com/result?p=css3d-cylinder)![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

## A simple, light-weight and extensible web component

This tool allows you to create n-faced cylinders with JS and CSS, no third-party packages used.
The cylinders can have any number of faces, can be dynamically sized or oriented, can be rotated or moved in any direction, and can easily be extended and overridden. however, each face of the cylinder must have an equal width (in case of a horizontally-oriented cylinder) or an equal height (in case of a vertically oriented cylinder).

## Installation

### Via NPM:

```bash
npm  install  --save  css3d-cylinder
```

### Via CDN:

ES Module:

```html
<script src="https://cdn.jsdelivr.net/npm/css3d-cylinder@latest/dist/index.module.js"></script>
```

non-module (exposes a global Cylinder class):

```html
<script src="https://cdn.jsdelivr.net/npm/css3d-cylinder@latest/dist/index.min.js"></script>
```

## Usage

In your HTML:

```html
<css3d-cylinder>
  <style>
    #items-container > div {
      height: 200px;
      width: 200px;
      background-color: #0000ff90;
      border: 1px solid white;
      color: white;
      text-align: center;
    }
  </style>
  <div>1</div>
  <div>2</div>
  <div>3</div>
  <div>4</div>
  <div>5</div>
</css3d-cylinder>
```

In Your JS:

```js
import Cylinder from "css3d-cylinder";
// The custom element can have any name you want.
customElements.define("css3d-cylinder", Cylinder);
```

## Components

The Cylinder consists of 4 components/elements:

```
Shadow Root
├── Perspective Container
| └── Items Container
| └── item 1
| └── item 2
| └── item 3
| ... (your items)
└── Overlay (Optional)
```

- The Shadow Root is isolated from your page's styles, script, etc... and holds everything inside the cylinder element.
- The Perspective Container holds the Items Container, and sets the CSS `perspective` property to give the Items Container depth, its element is given the ID `perspective-container`.
- The Items Container is what holds the cylinder's faces, the number of its children is automatically the number of the cylinder's faces, unless the `ignore` is applied to its child, in that case it won't be counted as a face and won't be transformed. its element is given the ID `items-container`.
- One child of the items container can have the `anchor` class combined with `ignore`, this will make that element get placed in the center of the cylinder.
- The Items Container's Z-origin gets sets to the radius of the cylinder, that way, it'd rotate about its center point.
- The Items Container's children get transformed, their Z-origin changes to the radius of the cylinder, and then they get rotated incrementally in the X or Y direction depending on the orientation of the cylinder.
- The radius of the cylinder is calculated by finding the radius of the largest inscribed circle in the regular polygon whose number of sides is that of Items Container's non-ignored children.
- The overlay is simply an absolutely-positioned div that is placed on top of your perspective container, it takes covers _the total visible area of the Items Container_ by making a `getBoundingClientRect()` call on every face of the cylinder to determine the total visible area.

## Styling

The cylinder runs in an isolated shadow DOM, hidden from your page's styles, in order to style it, you need to specify the styles inside the cylinder element, you can do so by simply using `style` or `link` tags, or you can use the `style` attribute.
You can select the cylinder's components with ID selectors (`#perspective-container`, `#items-container`, `#overlay` ).
If you're experiencing performance issues, it's recommended to set `contain` for the children of Items Container to `strict`, and set `will-change` of Items Container to `transform`.

### CSS Classes

Children of Items Container are treated differently if they're given the following classes:

- `ignore`
  When given that class, the child won't be counted as a face and won't be transformed. It'll lie on top of the first face.
- `anchor`
  When given that class combined with `ignore`, this will make that element get placed in the center of the cylinder. acting as a revolving point or a so-called "anchor".

## Attributes

| name                    | value     | description                                                                                                                                                                                                                                                                                                                                           |
| ----------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **vertical**            | `boolean` | Makes the cylinder vertically-aligned, by default it's horizontally-aligned                                                                                                                                                                                                                                                                           |
| with-overlay            | `boolean` | Determines whether the cylinder has an overlay or not, it's better to keep it off unless needed because it uses a lot of `getBoundingClientRect()` calls                                                                                                                                                                                              |
| items-container-element | `string`  | Sets the items container element (expects an HTML element name), by default it's `div`                                                                                                                                                                                                                                                                |
| **rotate-negative**     | `boolean` | Makes the cylinder wrap from right to left (by default it wraps from left to right), in case of a vertical cylinder, it makes it wrap from top to bottom                                                                                                                                                                                              |
| raw                     | `boolean` | Enables `raw mode` for the cylinder, the cylinder won't provide any elements, you'll provide them yourself, and the cylinder will put them inside the shadow DOM. You're expected to provide elements with the following IDs: `#perspective-container`, `#items-container`, `#overlay`. With `#items-container` being inside `#perspective-container` |
| debounce-rerender       | `number`  | Debounces re-renders triggered by thee resize observer, expects a valid integer in milliseconds                                                                                                                                                                                                                                                       |
| no-resize               | `boolean` | Removes the resize observer and mutation observer, useful for cases where you don't want the observer overhead and expect no resizes or changes to Items Container's children                                                                                                                                                                         |

_Note: the attributes in bold trigger an undebounced re-render when changed._
_Note: for `boolean` attributes, their presence sets them to true, so something like `vertical="false"` is still considered true because `vertical` is now present, if you want to set it to false, simply omit it._

## Properties

Every instance of `Cylinder` exposes the following properties:
| name | value | description |
| ------------------ | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| perspective | `HTMLElement` | The perspective element |
| itemsContainer | `HTMLElement` | The items container element |
| overlay | `HTMLElement` | The overlay element |
| anchorElem | `HTMLElement` | The anchor element (if present) |
| items | `NodeList` | The non-ignored children of Items Container |
| ignoredElems | `NodeList` | The ignored children of Items Container |
| styleElems | `NodeList` | The style tags in the cylinder |
| numSides | `integer` | The number of faces of the cylinder, equal to the length of `items` |
| rotDeg | `integer` | The number of degrees the Items Container should be rotated in the X or Y axis to show the next face of the cylinder |
| firstRender | `boolean` | Expresses whether the cylinder has done the first render or not, its value is `true` then its set to `false` after the first render |
| renderOut | `function` | Recalculates the radius of the cylinder and transforms the `items` accordingly, by default, it's called once when the component is connected, then it's called when a cylinder face is resized or when an attribute changes. |
| renderOutDebounced | `function` | The debounced `renderOut()` function, based on the `debounce-rerender` attribute |
| resizeObserver | `ResizeObserver` | The resize observer that observes every face of the cylinder and calls `renderOut()` whenever the dimensions of a face change. |
| mutationObserver | `MutationObserver` | The mutation observer that observes the child list of Items Container and triggers a re-render when their number changes. |

Accessing a property:

```js
document.getElementById("your-cylinder-id")[property];
```

## Examples

### Example 1:

This example creates a 3D logo carousel revolving around a lighthouse image as an anchor.
HTML:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script src="index.js" defer type="module"></script>
    <title>Cylinder</title>
    <style>
      * {
        box-sizing: border-box;
      }
      html,
      body {
        height: 100%;
        width: 100%;
        padding: 0;
        margin: 0;
      }
      body {
        background-color: #000020;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <css3d-cylinder>
      <style>
        .logo {
          height: 20vw;
          width: 20vw;
          max-width: 200px;
          max-height: 200px;
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 10px;
          contain: strict;
        }
        .logo:hover {
          background-color: yellow;
          cursor: pointer;
        }
        .logo > img {
          width: 90%;
          height: 90%;
          padding: 10px;
          background-color: navy;
          border-radius: 10px;
        }
        #items-container {
          animation: spin 10s infinite linear;
        }
        .anchor {
          animation: counter-spin 10s infinite linear;
          height: 100vh;
          width: 100%;
          background-image: url("https://static.vecteezy.com/system/resources/previews/019/806/316/original/lighthouse-graphic-clipart-design-free-png.png");
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
        }
        @keyframes spin {
          from {
            transform: rotateY(0deg);
          }
          to {
            transform: rotateY(360deg);
          }
        }
        @keyframes counter-spin {
          from {
            transform: rotateY(0deg);
          }
          to {
            transform: rotateY(-360deg);
          }
        }
      </style>
      <div class="logo"><img src="https://logo.uplead.com/amazon.com" /></div>
      <div class="logo"><img src="https://logo.uplead.com/github.com" /></div>
      <div class="logo"><img src="https://logo.uplead.com/facebook.com" /></div>
      <div class="logo"><img src="https://logo.uplead.com/lg.com" /></div>
      <div class="logo"><img src="https://logo.uplead.com/dell.com" /></div>
      <div class="logo"><img src="https://logo.uplead.com/hp.com" /></div>
      <div class="logo">
        <img src="https://logo.uplead.com/stackoverflow.com" />
      </div>
      <div class="logo"><img src="https://logo.uplead.com/google.com" /></div>
      <div class="logo"><img src="https://logo.uplead.com/medium.com" /></div>
      <div class="logo"><img src="https://logo.uplead.com/youtube.com" /></div>
      <div class="logo"><img src="https://logo.uplead.com/lenovo.com" /></div>
      <div class="logo"><img src="https://logo.uplead.com/apple.com" /></div>
      <div class="logo"><img src="https://logo.uplead.com/netflix.com" /></div>
      <div class="anchor ignore"></div>
    </css3d-cylinder>
    <a
      href="https://uplead.com"
      style="position: absolute; color: white; left: 0; right: 0; bottom: 1rem;"
      >Logos provided by UpLead</a
    >
  </body>
</html>
```

JS:

```js
// index.js
import Cylinder from "css3d-cylinder";
customElements.define("css3d-cylinder", Cylinder);
```

Result: https://jsfiddle.net/w3qkv49r/ (It is highly recommended to view this in fullscreen)

![Result gif](https://i.imgur.com/Mr6ScjO.gif)

### Example 2:

Now, onto more simplistic examples, this example creates a simple 5-faced cylinder with an image on each face.
HTML (Special thanks to [placedog](https://placedog.net) for providing the images):

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script src="index.js" defer type="module"></script>
    <title>Cylinder</title>
    <style>
      * {
        box-sizing: border-box;
      }
      html,
      body {
        height: 100%;
        width: 100%;
        padding: 0;
        margin: 0;
      }
    </style>
  </head>
  <body>
    <css3d-cylinder>
      <style>
        #items-container > div {
          height: 200px;
          width: 200px;
          background-color: #0000ff90;
          border: 1px solid white;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        #items-container {
          animation: spin 3s infinite;
        }
        @keyframes spin {
          from {
            transform: rotateY(0deg);
          }
          to {
            transform: rotateY(360deg);
          }
        }
      </style>
      <div><img src="https://placedog.net/100/120" /></div>
      <div><img src="https://placedog.net/150/110" /></div>
      <div><img src="https://placedog.net/80/100" /></div>
      <div><img src="https://placedog.net/110/105" /></div>
      <div><img src="https://placedog.net/120/115" /></div>
    </css3d-cylinder>
  </body>
</html>
```

JS:

```javascript
// index.js
import Cylinder from "css3d-cylinder";
customElements.define("css3d-cylinder", Cylinder);
```

Result: https://jsfiddle.net/0etbd9nL/

![Result gif](https://i.imgur.com/t9GHUAz.gif)

### Example 3:

This example creates a dynamically-sized 3D vertical carousel with controls.

HTML:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script src="index.js" defer type="module"></script>
    <title>Cylinder</title>
    <style>
      * {
        box-sizing: border-box;
      }
      html,
      body {
        height: 100%;
        width: 100%;
        padding: 0;
        margin: 0;
      }
      #controls {
        position: absolute;
        top: 0;
      }
    </style>
  </head>
  <body>
    <css3d-cylinder id="cylinder" vertical rotate-negative>
      <style>
        #items-container > div {
          height: 50vh;
          width: 200px;
          background-color: #0000ff90;
          border: 1px solid white;
          display: flex;
          justify-content: center;
          align-items: center;
          transition: 1s ease-in;
          contain: strict;
        }
        #items-container {
          transition: 0.15s ease-in;
          will-change: transform;
        }
        .filler {
          opacity: 0;
        }
      </style>
      <div><img src="https://placedog.net/100/120" /></div>
      <div><img src="https://placedog.net/150/110" /></div>
      <div><img src="https://placedog.net/80/100" /></div>
      <div><img src="https://placedog.net/110/105" /></div>
      <div><img src="https://placedog.net/120/115" /></div>
      <div class="filler"></div>
      <div class="filler"></div>
      <div class="filler"></div>
      <div class="filler"></div>
      <div class="filler"></div>
      <div class="filler"></div>
    </css3d-cylinder>
    <div id="controls">
      <button id="prev">prev</button>
      <button id="next">next</button>
    </div>
  </body>
</html>
```

JS:

```js
// index.js
import Cylinder from "css3d-cylinder";
customElements.define("css3d-cylinder", Cylinder);

const cylinderElem = document.getElementById("cylinder");

const maxRots = 5;
const minRots = 0;
let numRotations = 0;

const rotate = () =>
  (cylinderElem.itemsContainer.style.transform = `rotateX(${
    numRotations * cylinderElem.rotDeg
  }deg)`);
const mod = (n, m) => ((n % m) + m) % m;

document.getElementById("prev").onclick = () => {
  numRotations = mod(numRotations - 1, maxRots);
  rotate();
};

document.getElementById("next").onclick = () => {
  numRotations = mod(numRotations + 1, maxRots);
  rotate();
};
```

Result: https://jsfiddle.net/9qkbtr57/

![Result gif](https://i.imgur.com/bgPdzLw.gif)
