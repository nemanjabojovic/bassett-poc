---
name: format-frames
description: Context for working with formatFrames.js — the master sheet conversion script that updates data.json and data-complete.json
---

Read this document fully before making any changes to `scripts/formatFrames.js`, `data.json`, or `data-complete.json`.

## Overview

`scripts/formatFrames.js` reads a master Excel workbook and syncs frame data into two JSON files:

- `src/components/JolaPlayer/data.json` — all frames (all statuses)
- `src/components/JolaPlayer/data-complete.json` — only frames with `status: "Complete"`

Entry point: `runFormatFrames()` — runs SectionalsByoPart first, then StaticFramesPart (order matters: StaticFramesPart reads data.json for collection frame statuses set by SectionalsByoPart).

---

## Workbook source

`scripts/sheets/Hooker Furniture - Master Sheet.xlsx`

---

## Sheet types and how they are classified

### Static frame sheets (StaticFramesPart)
Hardcoded in `STATIC_FRAME_SHEETS`:
- `"Bradington Young Static Frames"` → brandId: `BY`
- `"Sunset West Static Frames"` → brandId: `SSW`, skuPrefix: `SW`, upholsteryFilter: `fabric`
- `"HF Custom Static Frames"` → brandId: `HF`

Produces frames with `staticFrame: true`. These go through `convertSheetsToFrameObjects`.

### Collection / BYO / Sectional sheets (SectionalsByoPart)
Classified by `classifySheet()` using two sources:
1. `SECTIONALS_BYO_SHEET_RULES` — explicit patterns:
   - `"sectionals"` — matches `/sectional/i`
   - `"buildYourOwn"` — matches `/byo|build your own|luxe for living|plaza midwood/i`
2. `getCollectionFromSheet()` fallback — any sheet recognized here gets category `"collection"`

`getCollectionFromSheet()` is the single source of truth for collection sheet identity. To add a new collection sheet, add an entry there. No other constant needs updating.

Current collection sheet mappings in `getCollectionFromSheet()`:
| Sheet name contains | brandId | collection slug |
|---|---|---|
| `"luxe"` | BY | `luxe-for-living` |
| `"sectional seating"` | BY | `sectional-seating-by-design` |
| `"plaza"` | BY | `plaza-midwood` |
| `"winter sectional"` | BY | `winter` |
| `"donovan sectional"` | BY | `donovan` |
| `"loft living"` | HF | `loft-living` |
| `"simply me"` | HF | `simply-me` |

Sheets classified as `"other"` (including all Static Frame sheets) are skipped by SectionalsByoPart.

---

## Column mappings

### StaticFramesPart (via `FRAME_COLUMN_ALIASES`)
| Sheet column | Normalized key | Output field |
|---|---|---|
| `SKU` | `sku` | `frame.sku` |
| `Name` / `Full name` | `name` | `frame.name` |
| `Batch` | `batchNumber` | `frame.batchNumber` |
| `CGI Status` | `status` | `frame.status` |
| `Collection` | `collection` | `frame.collectionName` ← display name, NOT the slug |

Note: the spreadsheet "Collection" column is a display name (e.g. "Havana"). It becomes `collectionName` on static frames, not `collection`. The `collection` slug field on static frames is only inherited from existing data.json if present.

### SectionalsByoPart (via `normalizeKeyName`)
Raw column names are camelCased. "Collection" → `collection` in the normalized row, but the output frame's `collection` slug comes from `getCollectionFromSheet(sheetName)`, not the column value.

---

## Frame types and unique keys

Two types of frames exist in data.json:

### Static frames
- Have `staticFrame: true`
- Unique key: `brandId:sku` (e.g. `SSW:SW4501-1`)
- May have `collectionName` (display name from sheet), rarely have `collection`
- Have `batchNumber`, `icon` (inferred as `./resources/icons/{modelPath}/static-frames/batch-{n}/{sku}.jpg`)

### Collection frames
- No `staticFrame` field (undefined)
- Unique key: `brandId:collection:sku` — SKU alone is NOT unique, the same SKU can appear in multiple collections
- Have `collection` (slug), `brandId`, `sku`, `name`, `status`, `icon`
- May have `arm`, `pairing`, `nails`, `animatedModel`

---

## data-complete.json sync logic

`applyConvertedFramesToTargetDataFile()` handles both types using `collectionFrameKey()`:
- Static frames → `static:brandId:sku`
- Collection frames → `collection:brandId:collection:sku`
- Other (no collection) → `brand:brandId:sku`

For data-complete.json:
- **Static frames**: only `status === "Complete"` frames from the spreadsheet are written. Scoped by brand — stale static frames for processed brands are removed.
- **Collection frames**: only `status === "Complete"` frames from data.json (freshly updated by SectionalsByoPart) are written. Stale collection frames for processed collections are removed.

---

## collectionOptions — source of truth

`data.json.collectionOptions` is the **manual, authoritative source** for all non-arm option types. These are never seeded or overwritten by the script — edit `data.json` directly to add, change, or remove entries.

### Types managed manually in data.json
| Type | Description |
|---|---|
| `backTypes` | Back style options per collection (e.g. Solid Back, Boxed Back) |
| `stitchTypes` | Stitch style options per collection (e.g. Double-Needle, Welt) |
| `baseTypes` | Leg/base options per collection (e.g. Square Wood Leg, Turned) |
| `seatCushionTypes` | Seat cushion options per collection (e.g. Standard, Bench) |

Each entry must have: `name`, `brandId`, `collection` (slug), `icon`, `objectNameSuffix`.

### armTypes
`armTypes` are **spreadsheet-driven** — they come from BYO sheet rows identified as arm rows (SKU starts with `side-` or has Side-L/Side-R flags). Do not add them manually.

### Adding a new option (e.g. a new seatCushionType)
Add the entry directly to the relevant array in `data.json.collectionOptions`. The script reads these at runtime via `getDataSchemas()` and passes them through unchanged.

### How getDataSchemas() builds CompleteBrands at runtime
`getDataSchemas()` reads `data.json.collectionOptions` and groups `backTypes`, `stitchTypes`, `baseTypes`, and `seatCushionTypes` by `brandId` → `collection` to construct `CompleteBrands` dynamically. No hardcoded brand/collection config exists — the structure is entirely derived from what is present in `data.json`.

---

## Adding a new collection

1. Add an entry to `getCollectionFromSheet()` in SectionalsByoPart — maps a sheet name substring to `{ brandId, collection }`.
2. That's it. `classifySheet()` picks it up automatically, `buildSectionalsByoObjectsInMemory()` groups it as `"collection"`, and `buildDataJsonFormattedSplit()` includes it in the merge.
3. To add option types (backTypes, seatCushionTypes, etc.) for the new collection, add them directly to `data.json.collectionOptions`.

---

## EMBEDDED_DATA_SCHEMAS

`const EMBEDDED_DATA_SCHEMAS` contains **only field schemas** — no brand or collection data:
- `frameSchema` — field definitions used by StaticFramesPart to parse spreadsheet rows
- `sectionalsByoFrameSchema` — field definitions used by SectionalsByoPart

`CompleteBrands` is **not** hardcoded here. It is built at runtime by `getDataSchemas()` from `data.json`. Do not add `CompleteBrands` back to this const.

---

## Static frame field clearing behavior

`applicationAreas`, `nails`, `legSwitch`, and `weltOptions` are **always assigned** from the spreadsheet on every run — even as `undefined`. If a field is unchecked/empty in the sheet, it is removed from data.json. The sheet is the sole authority for these fields; values are never preserved from data.json when the sheet says empty.

Same applies to arm `applicationAreas` in SectionalsByoPart — replaced entirely from the sheet row, not merged on top of existing.

## buildLegSwitch — brand-aware

`buildLegSwitch(rawRow, brandId)` splits behavior by brand:

**BY (and others):** reads hardcoded spaced column names with dropdown string values:
- `"Tapered Leg"` → `{ name: "taperedLeg", sku: "<value>" }`
- `"Turned Leg"` → `{ name: "turnedLeg", sku: "<value>" }`
- `"Misc Leg"` → parses `"<type> <sku>"` format (e.g. `"custom #49"` → `{ name: "customLeg", sku: "#49" }`)

**HF:** dynamically scans all raw row columns ending with `"Leg"` (excluding `"Leg Switch"`):
- Boolean/checkbox `true` → `sku` derived by stripping `"Leg"` suffix from column name (lowercase)
- String value → used as `sku` directly

Example HF: `"MetalLeg"` = `true` → `{ name: "metalLeg", sku: "metal" }`, `"WoodLeg"` = `true` → `{ name: "woodLeg", sku: "wood" }`

---

## Key functions quick reference

| Function | Part | What it does |
|---|---|---|
| `convertSheetsToFrameObjects()` | Static | Reads static frame sheets → frame objects with `staticFrame: true` |
| `generateConvertedSheetData()` | Static | Calls above, returns `{ frames }` |
| `buildApplicationAreas()` | Static | Builds applicationAreas from sheet row — returns undefined if nothing checked |
| `buildLegSwitch()` | Static | Builds legSwitch options from sheet row (pending rewrite for dynamic column scan) |
| `buildNails()` | Static | Builds nails config from sheet row |
| `buildWeltOptions()` | Static | Builds weltOptions from sheet row |
| `buildStaticFrameChangeSummary()` | Static | Diffs spreadsheet vs data.json, returns change summary + convertedFrames |
| `applyStaticFrameUpdatesToDataJson()` | Static | Orchestrates full static frame sync: data.json + data-complete.json + BrandsAndRules |
| `applyConvertedFramesToTargetDataFile()` | Static | Core update/add/remove logic for a target JSON file |
| `collectionFrameKey()` | Static | Returns the composite key for a frame based on its type |
| `recoverLegacyStaticFrameLookupKey()` | Static | Backward-compat for old SSW SKU format (SW + Excel serial) |
| `getDataSchemas()` | Sectionals | Reads data.json, builds CompleteBrands from collectionOptions, merges with EMBEDDED_DATA_SCHEMAS |
| `classifySheet()` | Sectionals | Returns category for a sheet name: sectionals / buildYourOwn / collection / other |
| `getCollectionFromSheet()` | Sectionals | Maps sheet name → `{ brandId, collection }` |
| `buildSectionalsByoObjectsInMemory()` | Sectionals | Reads all non-static sheets, normalizes rows, groups by category |
| `buildSeparatedOptionsFromSchemas()` | Sectionals | Groups collectionOptions by brandId/collection using CompleteBrands from getDataSchemas() |
| `mergeAdditionalOptionsWithDataJson()` | Sectionals | Merges separated options into data.json collectionOptions (pass-through for manually managed types) |
| `mergeFramesWithDataJson()` | Sectionals | Merges sheet objects into data.json frames (update/add, preserves unrelated frames) |
| `applyDataJsonFormattedSplit()` | Sectionals | Writes merged frames + collectionOptions to data.json and syncs data-complete.json collectionOptions |

---

## Run order

```
runFormatFrames()
  1. runSectionalsByoPart()   ← updates data.json collection frame statuses from spreadsheet
  2. runStaticFramesPart()    ← updates data.json static frames, then syncs data-complete.json
                                (reads collection frame statuses written in step 1)
```

StaticFramesPart must run second so data-complete.json collection frame sync uses fresh statuses.
