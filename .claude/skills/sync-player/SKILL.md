---
name: sync-player
description: Sync the JolaPlayer component from hookerfurniture-pwa into this project
---

Sync the JolaPlayer component from `~/projects/hookerfurniture-pwa` into this project.

**Source:** `/home/boja/projects/hookerfurniture-pwa/src/CgiSandbox/JolaPlayer/`
**Destination:** `/home/boja/projects/hooker/src/components/JolaPlayer/`

## File mapping

| Source (pwa)            | Destination (hooker)    | Notes                                     |
| ----------------------- | ----------------------- | ----------------------------------------- |
| `Core/core.js`          | `Core/core.js`          | Change `resourcesPath` to `'./resources'` |
| `Core/dimensions.js`    | `Core/dimensions.js`    | Copy as-is                                |
| `Core/contactShadow.js` | `Core/contactShadow.js` | Copy as-is                                |
| `Player/player.js`      | `Player/player.js`      | Copy as-is                                |
| `jolaPlayer.jsx`        | `jolaPlayer.jsx`        | Copy as-is                                |
| `utils.js`              | `utils.js`              | Copy as-is                                |
| `lightPresets.js`       | `lightPresets.js`       | Copy as-is                                |
| `devicePresets.js`      | `devicePresets.js`      | Copy as-is (create if missing)            |

## Instructions

For each file in the mapping above:

1. Read the source file from the pwa project
2. Compare it to the current destination file
3. If different, report what changed at a high level (new methods, bug fixes, new constants, etc.)
4. Write the updated file to the destination path
5. For `Core/core.js` only: after writing, replace `this.resourcesPath = '/media/resources'` with `this.resourcesPath = './resources'`

Do NOT sync `data.json`, `data-complete.json`, `applicationAreas.json`, `README.md`, `EXAMPLES.md`, or `CHANGELOG.md` — these are managed separately per project.

## Project-specific overrides (apply after copying)

After syncing `utils.js`, revert the fabric/leather lines to use unfiltered data:
```js
tabs.fabrics = data.fabrics;
tabs.leathers = data.leathers;
```
The pwa version filters by `status === 'Complete'` but this project does not.
