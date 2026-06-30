## JolaPlayer React Component

### Import

```js
import JolaPlayer from "./JolaPlayer";
import { resolveModelOptions } from "./JolaPlayer/utils";
```

---

### Mounting

Use a **ref** to control the player instance. After mount, the player is also accessible globally as `window.player`.

```jsx
import React, { useRef } from "react";

function MyPage({ sku }) {
  const playerRef = useRef();
  const options = resolveModelOptions(sku);

  return (
    <div id='configurator-container'>
      {options && (
        <JolaPlayer
          ref={playerRef}
          options={{
            ...options,
            containerId: "player",
            loadingScreenId: "loading-screen",
          }}
        />
      )}
    </div>
  );
}
```

**Required `options` fields:**

| Field | Type | Description |
| --- | --- | --- |
| `data` | object | Imported from `data.json` — frames, fabrics, leathers, etc. |
| `frame` | object | A frame object from `data.frames` |
| `staticFrame` | boolean | `true` for a static frame, `false` for a sectional model |
| `materialType` | string | `'Fabric'` or `'Leather'` — determines initial material |

`resolveModelOptions(sku)` builds these fields automatically. Returns `null` for an unrecognised SKU.

**Optional `options` fields:**

| Field | Type | Description |
| --- | --- | --- |
| `fabric` | array | Initial material assignments — each entry is `{ texture, name }` where `name` is a `dbValue` from `applicationAreas.json` |
| `popularConfiguration` | object | An entry from `data.popularConfigurations` to load on mount |
| `containerId` | string | DOM element ID to render into (default: `"configurator"`) |
| `loadingScreenId` | string | Loading overlay element ID |
| `signalModelConfigurationChange` | function | Fired when the configuration changes |
| `setSwapInitiated` | function | Fired when a swap starts |
| `setSwapCompleted` | function | Fired when a swap finishes |

---

### Container and Loading Screen

By default, JolaPlayer renders into `<div id="configurator"></div>` with a loading overlay at `id="loading-screen"`. Override both via `options.containerId` and `options.loadingScreenId`.

---

### Imperative API

Once mounted, call methods on `window.player` or `playerRef.current`:

| Method | Description |
| --- | --- |
| `loadFabric(entry, area, update)` | Apply a fabric or leather to a material area — `area` is `'main'` or a `dbValue` from `applicationAreas.json` |
| `setArmType(arm)` | Change the arm style — `arm` is an entry from `data.collectionOptions.armTypes` |
| `setConfiguration(cfg)` | Load a sectional configuration — `cfg` is an entry from `data.popularConfigurations` or a manually built object |
| `clearConfiguration()` | Remove all sectional pieces |
| `onDragStart(id)` | Begin dragging a sectional piece into the scene |
| `onDragEnd()` | End drag operation |
| `setDimensionsVisible(boolean)` | Show or hide the dimensions overlay |
| `getDimensions()` | Returns `{ width, height, depth }` computed from `data.json` values |
| `updateCameraPosition(preset)` | Move camera — supported presets: `'default'`, `'top'`, `'left'`, `'right'`, `'zoom-in'`, `'zoom-out'` |
| `getScreenshot(preset)` | Returns a data URL image of the scene at the given camera preset |
| `setSwapElement(model)` | Replace a piece in the current sectional configuration |
| `getSwapState()` | Returns the current swap state |
| `hasAnimation()` | Returns `true` if the current model has animations available |
| `playAnimation()` | Play available animations |
| `resize()` | Manually trigger renderer resize |
| `dispose()` | Unmount and release all Three.js resources |

---

### Disposal

Always call `dispose()` on unmount:

```jsx
useEffect(() => {
  return () => playerRef.current?.dispose();
}, []);
```

This cancels the render loop, removes event listeners, and disposes all Three.js geometries, materials, and textures.

---

With this API, JolaPlayer can be embedded anywhere in React, customised via `options`, and fully controlled by parent components.
