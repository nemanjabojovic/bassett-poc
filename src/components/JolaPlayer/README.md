## JolaPlayer React Component

### Import

```js
import JolaPlayer from "./JolaPlayer";
import { resolveModelOptions } from "./JolaPlayer/utils";
```

---

### Mounting

Use a **ref** to control the player instance:

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
            // optional overrides:
            containerId: "my-container",
            loadingScreenId: "loading-screen",
          }}
        />
      )}
    </div>
  );
}
```

- **`options`** must include at minimum:
  - `data` (object) — data (containing frames, brands, etc., imported from data.json)
  - `frame` (object) — a frame object from `data.frames`
  - `brand` (object) — a brand object from `data.brands`
  - `collection` (string) — the frame's collection string
  - `staticFrame` (boolean) — whether this is a static frame or a BYO model
  - `materialType` (string) — either `'fabric'` or `'leather'`, determines which material is initially applied

  The helper `resolveModelOptions(sku)` will build these fields (or return `null` for invalid SKUs).

* **`options`** can also include
  - `baseType` (object) — initial base entry from `data.collectionOptions.baseTypes`, matched with brand and collection
  - `stitchType` (object) — initial base entry from `data.collectionOptions.stitchTypes`, matched with brand and collection
  - `fabric` (object) — initial array of values from `data.fabrics` **(required if** `materialType === 'fabric'`**)**
  - `leather` (object) — initial array of values from `data.leathers` **(required if** `materialType === 'leather'`**)**
  - `nailOptions` (object) — can include three properties :
    - `nailColor` string value containing color, matching ids from `data.nails`, example "OldGold"
    - `nailOptionStandard` string value from the database, example "#9"
    - `nailOptionStandard2` string value from the database, example "#54"

---

### Container and Loading Screen

- By default, JolaPlayer will:
  - Render into a `<div id="configurator"></div>`
  - Use a loading overlay with ID `loading-screen`

- Override IDs via `options.containerId` and `options.loadingScreenId`.

---

### Imperative API

Once mounted, call methods on `playerRef.current`:

| Method                                                  | Description                                |
| ------------------------------------------------------- | ------------------------------------------ |
| `playerRef.current.loadFabric(f, name, update)`         | Change fabric or leather texture           |
| `playerRef.current.setConfiguration(cfg)`               | Apply a popular configuration              |
| `playerRef.current.setBaseType(type)`                   | Change base/leg style                      |
| `playerRef.current.setStitchType(type)`                 | Change stitch style                        |
| `playerRef.current.onDragStart(id, cameraUpdate)`       | Begin dragging a part into the scene       |
| `playerRef.current.onDragEnd()`                         | End drag operation                         |
| `playerRef.current.resize()`                            | Manually trigger renderer resize           |
| `playerRef.current.setEditSelected(val)`                | Toggle BYO edit mode                       |
| `playerRef.current.clearConfiguration()`                | Clear all BYO-added elements               |
| `playerRef.current.dispose()`                           | Unmount and clean up all resources         |
| `playerRef.current.setNailOptionStandard(value)`        | Set standard nail option                   |
| `playerRef.current.setNailOptionStandard2(value)`       | Set alternate standard nail option         |
| `playerRef.current.setNailsVisible(boolean)`            | Show or hide nails                         |
| `playerRef.current.setNailColor(color)`                 | Change nail color                          |
| `playerRef.current.updateCameraPosition(preset)`        | Change camera position                     |
| `playerRef.current.setDimensionsVisible(value)`         | Show/Hide dimensions                       |
| `playerRef.current.getDimensions()`                     | Get calculated width, height, and depth.   |
| `playerRef.current.getScreenshot(preset)`               | Returns dataURL image of the scene         |
| `playerRef.current.setSwapElement(selectedModel)`       | Swap configuration model                   |
| `playerRef.current.getSwapState()`                      | Get swap state                             |
| `playerRef.current.hasAnimation()`                      | Check if scene has animations (true/false) |
| `playerRef.current.playAnimation()`                     | Play animations                            |
| `playerRef.current.loadFinish()`                        | Change finish texture                      |
| `playerRef.current.setWeltOption(weltOption,weltArea?)` | Change welt option                         |
| `playerRef.current.getAppAreaFinish(appArea)`           | Returns application area current finish    |
| `playerRef.current.removeAppAreaFinish(appArea)`        | Removes application area current finish    |

---

### Example: Sidebar Integration

```jsx
import Sidebar from "./Sidebar";

// in your component:
<div id='configurator-container'>
  <JolaPlayer ref={playerRef} options={options} />
  <Sidebar playerRef={playerRef} options={options} />
</div>;
```

The `Sidebar` can read `options` to build tab lists via `resolveTabOptions(options)`, then call `playerRef.current.*` methods in its event handlers.

---

### Disposal

Always call `playerRef.current.dispose()` in your cleanup to:

- Cancel the render loop
- Remove event listeners
- Dispose of Three.js geometries, materials, textures
- Remove the WebGL canvas from the DOM

```jsx
useEffect(() => {
  return () => playerRef.current.dispose();
}, []);
```

---

With this API, JolaPlayer can be embedded anywhere in React, customized via `options`, and fully controlled by parent components.
