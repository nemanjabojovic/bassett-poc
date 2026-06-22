# Bassett POC Configurator Reference

## Tech Stack
- React CRA (`jola-configurator v0.2.0`)
- React Router (`useSearchParams`, `useNavigate`)
- MUI (Slider, Button, Typography, styled)
- JolaPlayer — proprietary 3D engine, accessed via `window.player` and a React ref

---

## Entry Point — `src/index.jsx`
- Single route: `/` → `<App />`
- `BrowserRouter` with `PUBLIC_URL` basename
- Clears localStorage/sessionStorage on page reload

---

## App.jsx — Central State Machine

The entire app is **URL-parameter driven**. URL params → React state → Player.

### URL Parameters
| Param | Example | Meaning |
|---|---|---|
| `brand` | `BY` | Brand shorthand |
| `conftype` | `Static Frames` or `Build Your Own` | Configurator mode |
| `model` | `406-25` | SKU for Static Frames mode |
| `collection` | `Luxury Motion` | Collection name for BYO mode |

### Key State Variables
| State | Type | Purpose |
|---|---|---|
| `brandInstance` | object | Full brand object from BrandsAndRules.json |
| `brandInstanceConfiguratorType` | object | Chosen configurator type object |
| `staticFramesConfiguratorType` | bool | true = Static Frames, false = BYO |
| `collection` | string | Selected collection name |
| `searchParamsModel` | string | SKU from URL params |
| `activePlayer` | `'Player'` / `null` | Controls landing vs player view |
| `isPanelOpen` | bool | Landing product panel open/closed |
| `isLeftSidebar` | bool | Responsive: left sidebar >1400px, bottom bar ≤1400px |

### Landing Page Logic
- Hero with background image
- Collapsible bottom panel with 4 hardcoded `FEATURED_PRODUCTS` (all BY brand)
- "Configure Now" button on each card → `handleConfigureNow(product)`
- `handleConfigureNow` sets URL params → `useEffect([searchParams, Brands])` triggers → sets all state → `activePlayer = 'Player'`

### Routing Logic (handleConfigureNow)
- Product name contains `"reclining sectional"` → `conftype=Build Your Own` + `collection=<collection>`
- All other products → `conftype=Static Frames` + `model=<sku>`

### URL-to-State useEffect
Runs on `[searchParams, Brands]` — reads URL and sets:
1. `brandInstance` (by `brand` shorthand)
2. `searchParamsModel` (by `model` param)
3. `brandInstanceConfiguratorType` (by `conftype` param)
4. If Static Frames → `staticFramesConfiguratorType = true`, `activePlayer = 'Player'`
5. If BYO + valid collection → `collection`, `staticFramesConfiguratorType = false`, `activePlayer = 'Player'`

### goToLanding()
Resets all state and clears URL params → returns to landing view.

---

## BrandsAndRules.json — Brand Configuration

### BY (Bradington Young)
- **Static Frames** — 10 batches
- **Sectionals** — collection: "Winter"
- **Build Your Own** — 4 collections:
  - Luxe for Living → armTypes, backTypes, stitchTypes, baseTypes
  - Sectional Seating by Design → armTypes, stitchTypes, baseTypes
  - Plaza Midwood → armTypes, baseTypes
  - Luxury Motion → armTypes only

### HF (HF-Custom)
- Static Frames (10 batches), Sectionals (13 collections), BYO (Loft Living, Simply Me)

### SSW (Sunset West)
- Static Frames only (7 batches)

---

## Player.jsx — Configurator View

### Props received from App
All state and setters: `brandInstance`, `brandInstanceConfiguratorType`, `collection`, `searchParamsModel`, `playerInstance`/`setPlayerInstance`, and all the auxiliary sidebar/option states.

### SKU Resolution (useEffect on `[collection, brandInstance, searchParams]`)
1. If `collection` param present:
   - Find first `armType` for that collection in `data.collectionOptions.armTypes`
   - Find first `popularConfiguration` for that collection
   - Build compound SKU: `armSku-frameSku`
   - Set `configurationToLoad` (popular config to preload)
2. If `model` param present → use SKU directly
3. Else → find first frame for the brand

### Options Resolution (useEffect on `[skuToLoad, configurationToLoad]`)
- Calls `resolveModelOptions(sku)` → returns frame, brand, collection, materialType
- Sets default material based on brand:
  - BY → leather `"922000-82"`
  - HF → fabric `"400569-04"`
  - SSW → fabric `"SW5404-0000"`
- Attaches `popularConfiguration`, `data`, and swap callbacks
- Sets `playerOptions` → triggers `<JolaPlayer>` render

### Layout (BEING REPLACED)
- Responsive: left sidebar (desktop >1400px) or bottom bar (mobile)
- `LeftSidebar` → `LeftSidebarSelect` (model picker, upholstery, etc.)
- `DeleteEditOption` — shown only for BYO (not Static Frames)
- `AdditionalOptions` — camera controls (right side)
- `Summary` — modal overlay
- Light Angle Slider (MUI)
- `JolaPlayer` — the 3D canvas

---

## resolveModelOptions(sku) — `src/components/JolaPlayer/utils.js`

Priority order:
1. Strip `-KIT` suffix (unless `-EASH` or `-CCAN` present — those disable fallback)
2. Strip excess segments (keep max 3: Base-S1-S2)
3. Exact match in `data.frames`
4. Shorter SKU match (strip last segment)
5. BYO fallback: split `armSku-frameSku-backSku`, look up arm + frame in collectionOptions

---

## JolaPlayer — `src/components/JolaPlayer/`

### Init Options Object
```js
{
  containerId: 'player',
  loadingScreenId: 'loading-screen',
  frame: { ... },            // from data.frames
  brand: { ... },            // from data.brands
  collection: '...',
  materialType: '...',       // upholsteryFilter from frame
  staticFrame: bool,
  fabric: [{ texture: {...}, name: 'PrimaryCover' }],
  nailOptions: { nailsColor, nailOptionStandard, nailOptionStandard2 },
  popularConfiguration: { ... },
  data: { ... },             // full data.json
  setSwapInitiated: fn,
  setSwapCompleted: fn,
}
```

### window.player API
| Method | Description |
|---|---|
| `resize()` | Resize canvas after layout change |
| `updateCameraPosition(view)` | `"default"`, `"right"`, `"left"`, `"top"`, `"zoom-in"` |
| `downloadScreenshot()` | Save screenshot |
| `setDimensionsVisible(bool)` | Toggle dimension overlays |
| `playAnimation()` | Toggle animation |
| `showSummary()` | Populate summary modal data |
| `changeLightsSlider(angle)` | Set light angle (0–360) |
| `resetLightsSlider()` | Reset light to default |
| `isDragging` | bool — drag state |
| `onDragEnd()` | Manually fire drag end |
| `dispose()` | Destroy player instance |
| `selectedArmType.nails` | Current arm's nail config |
| `defaultFabric.name` | Current default fabric name |
| `dimensionsVisible` | bool |

### Custom Window Events (dispatched by JolaPlayer)
| Event | Meaning |
|---|---|
| `nailsAvailable` / `nailsNotAvailable` | Whether current model has nail options |
| `weltOptions` / `NoWeltOptions` | Welt options available |
| `legSwitchAvailable` / `legSwitchNotAvailable` | Base/leg type switchable |
| `seatCushionSwitchAvailable` / `seatCushionSwitchNotAvailable` | Seat cushion options |
| `animationsAvailable` / `animationsNotAvailable` | Animation available |

---

## data.json Structure — `src/components/JolaPlayer/data.json`

```
brands[]           — id, name, modelPath
frames[]           — sku, brandId, collection, staticFrame, upholsteryFilter
collectionOptions:
  armTypes[]       — name, collection, brandId, sku, icon, nails, applicationAreas
  backTypes[]
  baseTypes[]
  stitchTypes[]
popularConfigurations[]  — collection, brandId, elements[]
fabrics[]
leathers[]
```

---

## Existing Option Tabs (LeftSidebar — being replaced)

Always shown:
- Model
- Upholstery
- Finish

Conditionally shown (from additionalOptions or window events):
- Arm Types — if `additionalOptions.armTypes` exists for collection
- Back Types — if `additionalOptions.backTypes` exists
- Seat Cushion — if `seatCushionSwitchAvailable` event fired
- Stitch Types — if `additionalOptions.stitchTypes` exists
- Base Types — if `legSwitchAvailable` event fired
- Nails — if `nailsAvailable` event fired
- Welt Options — if `weltOptions` event fired

---

## Existing Bottom-Bar Components (Summary/Price — partially implemented)

### PriceCtaInfo
- Price display (TODO — not connected to player)
- "VIEW SUMMARY" → calls `playerInstance.showSummary()` then opens `<Summary>`
- "ADD TO CART" (TODO — not implemented)

### SpecificationInfo
- Body Fabric: reads `playerInstance.defaultFabric.name`
- Dimensions: W/D/H (TODO — not pulling from player)
- Weight (TODO)

### Summary (modal)
- Sections: Your Build, Upholstery, Leg, Accessories (hidden), Description
- All data fields are placeholders — not wired to live player state

---

## Current File Structure

```
src/
  index.jsx              — entry, single route /
  App.jsx                — state machine, landing page, routing
  index.css              — all styles
  pages/
    Player.jsx           — configurator view (BEING REDESIGNED)
    LandingPage.jsx      — stub only
  components/
    JolaPlayer/          — 3D engine (DO NOT MODIFY)
      index.js
      jolaPlayer.jsx
      jolaPlayer.css
      data.json
      utils.js
      ...
    LeftSidebar.jsx      — icon nav + panel toggle (BEING REPLACED)
    LeftSidebarSelect.jsx — content panel (BEING REPLACED)
    AdditionalOptions.jsx — camera controls (BEING REPLACED)
    DeleteEditOption.jsx  — BYO drag/drop controls (BEING REPLACED)
    Summary.jsx          — summary modal (BEING REPLACED)
    PriceCtaInfo.jsx     — price + CTA buttons (BEING REPLACED)
    SpecificationInfo.jsx — dimensions/fabric info (BEING REPLACED)
    Button.jsx
    [MenuCard components] — model/upholstery/arm/back/base/stitch/welt/nail pickers
  data/
    BrandsAndRules.json  — brand + configurator type definitions
  assets/
    images/background-home.png
    images/main_logo.png
    icons/
    fonts/
```

---

## What Is Being Redesigned

### Target Design (Bassett configurator screenshot)
- Full-screen 3D viewer (no sidebar)
- **Right panel** slides in — white, fixed width ~290px
  - X close button (top right)
  - Product name + SKU
  - Option dropdowns with color swatch previews (Fabric Options, Cushion Options, etc.)
  - Visual swatch cards for sub-options (image + name + optional price delta + "New" badge)
  - Dimensions bar at bottom (Height / Width / Depth)
  - Price display (`$8,439.99`)
  - "VIEW SUMMARY" + "ADD TO CART" CTAs
- **Top-left icons**: jola logo + back arrow
- **Top-right icon**: AR/3D view toggle
- **Top-left label**: current category/batch name (small text)

### Components to Remove (after redesign is in place)
- LeftSidebar.jsx + LeftSidebarSelect.jsx
- DeleteEditOption.jsx
- Light Angle Slider (MUI — inside Player.jsx)
- All MenuCard components (ArmTypeMenuCard, BackTypeMenuCard, etc.)

### Components to Keep
- JolaPlayer (untouched)
- Summary.jsx (will be restyled)
- PriceCtaInfo.jsx (will be restyled or replaced inline)
- AdditionalOptions.jsx (camera controls — will be restyled)
- Button.jsx

### New Logic Needed (TBD)
- New data source for product options (fabric swatches, cushion options, pricing)
- Right panel open/close state
- Option selection → `window.player` API calls
- Price calculation
- Dimensions from player events or data
