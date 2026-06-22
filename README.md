# Hooker Furniture

## Installation

Install Hooker Project with:

```bash
    npm install
```

Symling local resources

Git repository for resources(Models,textures,etc) `git@git.joladev.com:hookerfurniture-3d.git`

```bash
ln -s ~/projects/hookerfurniture-3d/ ~/projects/hooker/public/resources
```

Mount Network Drive in WSL (where **Z** is assigned network drive letter in Windows for **\\\\JolaNAS\dev**)

```bash
    sudo mount -t drvfs Z: /mnt/z -o uid=$(id -u),gid=$(id -g),metadata
```

Create Symbolic link between mounted drive and public/resources

```bash
    ln -s /mnt/z/projects/hooker-furnishings/resources public/resources
```

Start Hooker Project with:

```bash
    npm run start
```

Build Hooker Project with:

```bash
    npm run build
```

## Data Update Pipeline

Single entry command (covers/leathers/finishes + static frames + sectionals/BYO):

```bash
bash scripts/update-data.sh
```

What `scripts/update-data.sh` does:

- Downloads and applies covers/leathers/finishes updates when source sheet changes
- Runs `scripts/formatFrames.js` for static frames + sectionals/BYO
- Prints changed/new frame summaries directly to bash output
- Builds the app (`npm run build`) after data updates
