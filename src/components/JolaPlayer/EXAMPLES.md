# JolaPlayer Usage Examples

This document shows common usage patterns for controlling the `JolaPlayer` instance via its imperative API.

---

## Initializing the Player

```jsx
import React, { useRef, useEffect } from "react";
import JolaPlayer from "./JolaPlayer";
import { resolveModelOptions } from "./JolaPlayer/utils";

export default function ProductConfigurator({ sku }) {
  const playerRef = useRef();
  const options = resolveModelOptions(sku);

  return <JolaPlayer ref={playerRef} options={options} />;
}
```

- The `resolveModelOptions(sku)` helper builds the minimum `options` object.
- `playerRef.current` becomes your entry point for all commands.

---

## Setting Fabrics or Leathers

Change the material on the model at runtime:

```jsx
// Inside a button onClick handler:
<button
    onClick={() => {
        const fabricEntry = data.fabrics.find(f => f.name === '401400-82');
        playerRef.current.loadFabric(fabricEntry, materialName, true);
    }}
>
    Switch to Fabric
</button>

<button
    onClick={() => {
        const leatherEntry = data.leathers.find(f => f.name === '922000-82');
        playerRef.current.loadFabric(leatherEntry, materialName, true);
    }}
>
    Switch to Leather
</button>
```

- `fabricEntry` is any object from `data.fabrics`.
- `leatherEntry` is any object from `data.leathers`.
- The second argument (`materialName`) should match an entry in applicationAreas.json, or should be `'main'` if it's applied overall.
- The third flag forces an immediate texture update.

---

## Setting Initial Fabrics or Leathers

When initializing player options, if you want to set initial set of values for application areas, for either fabric or leather material type, you can do so after resolving default options

```jsx
let playerOptions = resolveModelOptions(productSku);

playerOptions.fabric = [
  {
    texture: {
      name: "614300-45",
      map: "/media/resources/textures/fabrics/614300-45/614300-45.webp",
      icon: "/media/resources/textures/fabrics/614300-45/614300-45_icon.webp",
      normalMap:
        "/media/resources/textures/fabrics/614300-45/614300-45_normal.webp",
      type: "Fabric",
      repeatWidth: 13,
      repeatHeight: 13,
    },
    name: "PrimaryCover",
  },
  {
    texture: {
      name: "401400-82",
      map: "/media/resources/textures/fabrics/401400-82/401400-82.webp",
      icon: "/media/resources/textures/fabrics/401400-82/401400-82_icon.webp",
      normalMap:
        "/media/resources/textures/fabrics/401400-82/401400-82_normal.webp",
      type: "Fabric",
      repeatWidth: 12,
      repeatHeight: 12,
    },
    name: "ContrastingOutsideArm",
  },
];
```

Where `'texture'` is entry from either `'data.fabrics'` or `'data.leathers'`, and name we get from the database and it matches `'applicationAreas.json'`

## Setting a Pre‑Defined Configuration

Load a popular configuration (frame + arms + back?):

```jsx
// Assume `popularConfigs` is an array from data.popularConfigurations
const config = popularConfigs.find(pc => pc.name === 'Motion: 55-67-56');

// Or config can be manually created
const config = {
    "elements": [
        {
            "id": "55"
        },
        {
            "id": "67"
        },
        {
            "id": "56"
        }
    ],
    "name": "Motion: 55-67-56", // This is irrelevant for configurator
    "icon": "/media/resources/icons/bradington-young/luxe-for-living/55-67-56.jpg", // This is irrelevant for configurator
    "collection": "luxe-for-living",
    "brandId": "BY",

    "popularConfig": true
}

<button onClick={() => playerRef.current.setConfiguration(config)}>
    Set Config
</button>;
```

- `config` contains all SKU references and will internally load the correct GLTF and textures.

---

## Setting a Base/Leg Style

```jsx
// Loop through baseTypes in Sidebar
const base = data.collectionOptions.baseTypes.find(b => b.name === 'Turned' && b.brandId === 'BY' && b.collection === 'sectional-seating-by-design');

// Or create custom base object
const base = {
    name: 'Turned',
    collection: 'sectional-seating-by-design',
    brandId: 'BY',
    objectNameSuffix: 'Turned'
    icon:
        '/media/resources/icons/bradington-young/sectional-seating-by-design/Turned.jpg', // This is irrelevant for configurator
};
playerRef.current.setBaseType(base);
```

- `base` is any object from `data.collectionOptions.baseTypes`.

---

## Setting a Stitch Style

```jsx
// Loop through stitchTypes in Sidebar
const base = data.collectionOptions.stitchTypes.find(b => b.name === 'Double-Needle' && b.brandId === 'BY' && b.collection === 'sectional-seating-by-design');

// Or create custom stitchType object
const base = {
    "name": "Double-Needle",
    "collection": "sectional-seating-by-design",
    "brandId": "BY",

    "icon": "/media/resources/icons/bradington-young/sectional-seating-by-design/Double-Needle.jpg",
    "objectNameSuffix": "Double-Needle"
},
playerRef.current.setBaseType(base);
```

- `base` is any object from `data.collectionOptions.baseTypes`.

---

## Setting a Back Style

```jsx
// Loop through baseTypes in Sidebar
const base = data.collectionOptions.baseTypes.find(b => b.name === 'Knife Edge' && b.brandId === 'HF' && b.collection === 'simply-me');

// Or create custom base object
const base = {
    name: 'Turned',
    collection: 'sectional-seating-by-design',
    brandId: 'BY',
    objectNameSuffix: 'Turned'
    icon:
        '/media/resources/icons/bradington-young/sectional-seating-by-design/Turned.jpg', // This is irrelevant for configurator
};
playerRef.current.setBackType(base);
```

- `base` is any object from `data.collectionOptions.baseTypes`.

---

## Drag‑and‑Drop BYO Elements

Enable dragging sectional pieces into the scene:

```jsx
// onDragStart in item tile:
<div
  draggable
  onDragStart={(e) => playerRef.current.onDragStart(frame.id)}
  onDragEnd={() => playerRef.current.onDragEnd()}
>
  {/* tile contents */}
</div>
```

- `frame.id` corresponds to a placeholder space in the 3D model.

---

## Clearing a BYO Configuration

Remove all custom-placed pieces:

```jsx
<button onClick={() => playerRef.current.clearConfiguration()}>
  Clear All
</button>
```

---

## Manual Resize (Responsive Layout)

If your canvas container changes size:

```jsx
window.addEventListener("resize", () => {
  playerRef.current.resize();
});
```

---

## Setting Nail Size

Since we have two "areas" of nails where they are applied, we separated that into two functions `'setNailOptionStandard'` and `'setNailOptionStandard2'`. They both require a value from database that would indicate the size that's applied

```jsx
playerRef.current.setNailOptionStandard("#54");
playerRef.current.setNailOptionStandard2("#9");
```

---

## Setting Nail Color

Setting Nail Color is quite simple, all you have to do is pass the string of nail color that we're getting from the database

```jsx
playerRef.current.setNailColor("BlackNickel");
```

---

## Setting Nails Visible

All you have to do is call this function with boolean parameter

```jsx
playerRef.current.setNailsVisible(true);
```

## Setting Initial Nail options

When initializing player options, if you want to set initial set of values for nail options, you can do so after resolving default options

```jsx
let playerOptions = resolveModelOptions(productSku);

options.nailOptions = {
  nailColor: "OldGold",
  nailOptionStandard: "#9",
  nailOptionStandard2: "#54",
};
```

## Changing camera position with presets

Call updateCameraPosition(preset) where preset is one of the supported: 'default', 'top', 'left', 'right', 'zoom-in', 'zoom-out'. If no parameter is passed, the default preset is applied.

```jsx
playerRef.current.updateCameraPosition("top");
```

## Adding dimensions to individual frames

For better accuracy we recommend adding property `dimensions` which will be pulled from database and used as width, height, and depth instead of dimensions generated by 3D model itself.
Example property `"dimensions": {"width": 30, "depth": 38, "height": 39}`
Property should be added before importing `data.json`.

Example of frame before added dimensions:
`{
      "id": "38",
      "sku": "38",
      "icon": "./resources/icons/bradington-young/plaza-midwood/38.jpg",
      "collection": "plaza-midwood",
      "brandId": "BY",
      "nails": true,
      "name": "Armless Chair",
      "pairing": {
        "left": ["38", "41", "57", "66", "68", "78", "83", "93", "CO", "SO"],
        "right": ["38", "42", "58", "66", "68", "78", "84", "94", "CO", "SO"]
      },
      "status": "Complete"
    }`
Example of frame after dimensions:
`{
      "id": "38",
      "sku": "38",
      "icon": "./resources/icons/bradington-young/plaza-midwood/38.jpg",
      "collection": "plaza-midwood",
      "brandId": "BY",
      "nails": true,
      "name": "Armless Chair",
      "dimensions": {"width": 30, "depth": 38, "height": 39},
      "pairing": {
        "left": ["38", "41", "57", "66", "68", "78", "83", "93", "CO", "SO"],
        "right": ["38", "42", "58", "66", "68", "78", "84", "94", "CO", "SO"]
      },
      "status": "Complete"
    }`

## Show/hide dimensions

Call setDimensionsVisible(boolean) to show/hide dimensions. Dimensions show width, height and depth. Values shown are computed from values in `'data.json'` for each sku in configuration.

```jsx
playerRef.current.setDimensionsVisible(true);
```

## Get width, height, and depth

Call `getDimensions()` to return an object containing the calculated width, height, and depth.  
These dimensions are computed using values from `data.json` for each SKU in the configuration.

**Return example:**
{ height: Number, width: Number, depth: Number }

```jsx
playerRef.current.getDimensions();
```

## Get screenshoot

Call `getScreenshot(preset)` to return dataURL image of the scene where preset is one of the supported: 'default', 'top', 'left', 'right'. If no parameter is passed, camera position will be current camera position.

```jsx
playerRef.current.getScreenshot("default");
```

## Swapping the model

Call `setSwapElement(selectedModel)` to replace the model from the configuration with the newly selected model in the UI:

```jsx
playerRef.current.setSwapElement(selectedModel);
```

## Swap state

Call `getSwapState()` to get current swap state:

```jsx
playerRef.current.getSwapState();
```

## Setting Finish

Change the finish material on the model at runtime:

```jsx
// Inside a button onClick handler:
<button
  onClick={() => {
    const finishEntry = data.finishes.find((f) => f.sku === "AH-AmericanHoney");
    playerRef.current.loadFinish(finishEntry);
  }}
>
  Switch Finish
</button>
```

- `finishEntry` is any object from `data.finishes`.

---

## Setting Initial Fabrics or Leathers

When initializing player options, if you want to set initial finish, you can do so after resolving default options

```jsx
let playerOptions = resolveModelOptions(productSku);

playerOptions.finish = {
  name: "BY MH-Mahogany",
  sku: "MH-Mahogany",
  brandId: "BY",
  map: "./resources/textures/woods/BY MH-Mahogany/BY MH-Mahogany.jpg",
  normalMap:
    "./resources/textures/woods/BY MH-Mahogany/BY MH-Mahogany_normal.jpg",
  roughnessMap:
    "./resources/textures/woods/BY MH-Mahogany/BY MH-Mahogany_roughness.jpg",
  icon: "./resources/textures/woods/BY MH-Mahogany/BY MH-Mahogany_icon.jpg",
  type: "Wood",
  repeatWidth: 8,
  repeatHeight: 8,
  status: "In Progress",
};
```

Where object passed is entry from `'data.finishes'`.

## Setting welt option

Call setWeltOption(weltOption, weltArea) to change option visibility. The property weltOption is passed as a string and is mandatory; weltArea is optional and will default to 'Cushion' if not passed.

```jsx

// Example: Setting welt option for the default area (Cushion)
<button
    onClick={() => {
        playerRef.current.setWeltOption('SW-SelfWelt');
    }}
>
</button>

// Example: Setting welt option for a specific area
<button
    onClick={() => {
        playerRef.current.setWeltOption('SW-SelfWelt', 'Front Pillow');
    }}
>
</button>
```

## Getting application area finish

Call getAppAreaFinish(appArea) to return object of current finish loaded for that application area.
Matches `appArea` against `dbValue` in `applicationAreas.json` (returns `null` on failure).

```jsx
// Example: Get the finish data for the "ContrastingSeat" area
playerRef.current.getAppAreaFinish("ContrastingSeat");
```

## Getting application area finish

Call removeAppAreaFinish(appArea) to remove loaded finish from that application area.
Materials removed will fallback to `PrimaryCover` or if logic is set to its coresponding material.

```jsx
// Example: Removes finish assinged the "ContrastingSeat" area material/materials
playerRef.current.removeAppAreaFinish("ContrastingSeat");
```

Important note: `PrimaryCover` can only be reassigned! Removal of `PrimaryCover`(`main` material) will crash configugurator since `PrimaryCover` is fallback and must allways exist.
