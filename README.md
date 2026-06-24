# Bassett Furniture Configurator

POC 3D furniture configurator built with React and the Jola Player engine. Supports static frame configuration (fabrics, finishes, edge profiles, size) and sectional/BYO configuration (layouts, arms, covers, cushions).

---

## Prerequisites

- Node.js 18+
- npm
- Git (for resources repository)
- WSL2 (if running on Windows)

---

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd bassett-poc
```

### 2. Install dependencies

```bash
npm install
```

### 3. Link 3D resources

The player requires a `public/resources` folder containing models, textures, HDR maps, and Draco decoders. These live in a separate repository.

** Clone the resources repo and symlink it:**

```bash
git clone git@git.joladev.com:bassett-3d.git ~/projects/bassett-3d
ln -s ~/projects/bassett-3d/ public/resources
```

## Running the project

```bash
npm start
```

Opens at `http://localhost:3000/bassett-furniture`

---

## Building for production

```bash
npm run build
```

The build script removes the `public/resources` symlink before bundling (resources are served separately at runtime) and restores it after.

---

## Project structure

```
bassett-poc/
├── public/
│   └── resources/          Symlink to 3D assets (models, textures, HDR, Draco)
├── src/
│   ├── assets/
│   │   ├── fonts/          Soleil font family
│   │   ├── icons/          UI icons (SVG + PNG)
│   │   └── images/         Product and option images
│   ├── components/
│   │   ├── JolaPlayer/     3D player engine (do not modify)
│   │   │   ├── data.json   Product data (frames, textures, configurations)
│   │   │   └── utils.js    SKU resolution helpers
│   │   ├── modals/         Modal components
│   │   │   ├── ClearConfirmModal.jsx
│   │   │   ├── CloseConfirmModal.jsx
│   │   │   ├── BuildOverview.jsx
│   │   │   ├── SectionalSummaryModal.jsx
│   │   │   └── StaticSummaryModal.jsx
│   │   ├── SectionalPanel.jsx   Sidebar for sectional/BYO frames
│   │   ├── StaticFramePanel.jsx Sidebar for static frames and tables
│   │   └── AdditionalOptions.jsx
│   ├── pages/
│   │   └── Player.jsx      Main configurator page
│   ├── data/
│   │   └── BrandsAndRules.json
│   ├── App.jsx             Root component and landing page
│   └── index.css           Global styles
```

---

## Resources structure

The `public/resources` folder (symlinked from the 3D assets repo) must contain:

```
resources/
├── models/         3D model files (.gltf)
├── textures/
│   ├── fabrics/    Fabric texture maps and icons
│   ├── leathers/   Leather texture maps and icons
│   └── woods/      Wood texture maps and icons
├── hdr/            HDR environment maps
├── draco/          Draco decoder (WASM)
├── fonts/          3D scene fonts
└── icons/          In-scene icons
```

---

## Environment variables

Copy `.env` and adjust as needed:

| Variable                          | Description                                  |
| --------------------------------- | -------------------------------------------- |
| `PUBLIC_URL`                      | Base URL path (default `/bassett-furniture`) |
| `REACT_APP_ASSET_VALIDATOR_TOKEN` | Optional token for asset validation server   |
