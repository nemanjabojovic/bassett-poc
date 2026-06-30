# JolaPlayer Usage Examples

This document shows common usage patterns for controlling the `JolaPlayer` instance via its imperative API.

---

## Initializing the Player

```jsx
import React, { useRef } from "react";
import JolaPlayer from "./JolaPlayer";
import { resolveModelOptions } from "./JolaPlayer/utils";

export default function ProductConfigurator({ sku }) {
  const playerRef = useRef();
  const options = resolveModelOptions(sku);

  return <JolaPlayer ref={playerRef} options={options} />;
}
```

- `resolveModelOptions(sku)` builds the minimum `options` object from `data.json`.
- After mount, the player is also accessible globally as `window.player`.

---

## Setting Fabrics or Leathers

Change the material on the model at runtime:

```jsx
// Inside a button onClick handler:
<button
    onClick={() => {
        const fabricEntry = data.fabrics.find(f => f.sku === '1629-2');
        window.player.loadFabric(fabricEntry, 'main', true);
    }}
>
    Switch to Fabric
</button>

<button
    onClick={() => {
        const leatherEntry = data.leathers.find(f => f.sku === '7219-28');
        window.player.loadFabric(leatherEntry, 'main', true);
    }}
>
    Switch to Leather
</button>
```

- `fabricEntry` is any object from `data.fabrics`.
- `leatherEntry` is any object from `data.leathers`.
- The second argument is the material area name — use `'main'` to apply overall, or a `dbValue` from `applicationAreas.json` for a targeted area.
- The third flag forces an immediate texture update.

---

## Setting Initial Fabrics or Leathers

When initializing player options, pass an array of area assignments to pre-load textures:

```jsx
let playerOptions = resolveModelOptions(productSku);

playerOptions.fabric = [
  {
    texture: {
      sku: "1629-2",
      name: "Sesame",
      map: "./resources/textures/fabrics/1629-2/1629-2.webp",
      icon: "./resources/textures/fabrics/1629-2/1629-2_icon.webp",
      normalMap: "./resources/textures/fabrics/1629-2/1629-2_normal.webp",
      type: "Fabric",
      repeatWidth: 24,
      repeatHeight: 24,
    },
    name: "PrimaryCover",
  }
];
```

`texture` is an entry from `data.fabrics` or `data.leathers`. `name` is the `dbValue` from `applicationAreas.json`.

---

## Setting a Pre-Defined Configuration

Load a popular configuration (a set of sectional piece IDs):

```jsx
const config = data.popularConfigurations.find(popularConfiguration => popularConfiguration.name === '41 & 43');

// Or build one manually:
const config = {
  elements: [
    { id: "41" },
    { id: "43" }
  ],
  name: "41 & 43",
  collection: "bassett",
  brandId: "bassett",
  popularConfig: true
};

window.player.setConfiguration(config);
```

- `config.elements` is an array of frame IDs that map to pieces in `data.frames`.

---

## Setting an Arm Type

Change the arm style on the current model:

```jsx
const arm = data.collectionOptions.armTypes.find(
  arm => arm.name === 'Slope_Arm' && arm.brandId === 'bassett'
);

window.player.setArmType(arm);
```

- `arm` is any object from `data.collectionOptions.armTypes`.

---

## Drag-and-Drop BYO Elements

Enable dragging sectional pieces into the scene:

```jsx
<div
  draggable
  onDragStart={() => window.player.onDragStart(frame.id)}
  onDragEnd={() => window.player.onDragEnd()}
>
  {/* tile contents */}
</div>
```

- `frame.id` corresponds to a placeholder space in the 3D model.

---

## Clearing a BYO Configuration

Remove all custom-placed pieces:

```jsx
window.player.clearConfiguration();
```

---

## Manual Resize

If your canvas container changes size:

```jsx
window.addEventListener("resize", () => {
  window.player.resize();
});
```

---

## Changing Camera Position with Presets

Supported presets: `'default'`, `'top'`, `'left'`, `'right'`, `'zoom-in'`, `'zoom-out'`. If no parameter is passed, the default preset is applied.

```jsx
window.player.updateCameraPosition("top");
```

---

## Adding Dimensions to Individual Frames

For better accuracy, add a `dimensions` property to frames in `data.json`:

```json
{
  "id": "41",
  "sku": "41",
  "icon": "",
  "collection": "bassett",
  "brandId": "bassett",
  "name": "Armless Chair",
  "dimensions": { "width": 30, "depth": 38, "height": 39 },
  "pairing": {
    "left": ["41", "43"],
    "right": ["41", "43"]
  },
  "status": "Complete"
}
```

Values are used as width, height, and depth instead of dimensions derived from the 3D model.

---

## Show/Hide Dimensions

```jsx
window.player.setDimensionsVisible(true);
```

---

## Get Width, Height, and Depth

Returns an object with the calculated dimensions based on `data.json` values for each SKU in the configuration:

```jsx
const dims = window.player.getDimensions();
// { height: Number, width: Number, depth: Number }
```

---

## Get Screenshot

Returns a data URL image of the scene. Supported presets: `'default'`, `'top'`, `'left'`, `'right'`. If no preset is passed, the current camera position is used.

```jsx
const dataUrl = window.player.getScreenshot("default");
```

---

## Swapping the Model

Replace a piece in the configuration with a newly selected model:

```jsx
window.player.setSwapElement({ id: selectedFrame.id });
```

---

## Swap State

Get the current swap state:

```jsx
const state = window.player.getSwapState();
```
