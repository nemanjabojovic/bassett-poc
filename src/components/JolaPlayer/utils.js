import data from "./data.json";

// SKU segments that indicate a product variant without its own 3D model.
// When any of these are present, SKU fallback-stripping is disabled so the
// shorter base SKU cannot accidentally resolve to a 3D-capable frame.
// Add new entries here as new non-visualized variant types are introduced.
const NO_FALLBACK_SKU_SEGMENTS = ["-EASH", "-CCAN"];

const hasNoFallbackSegment = (sku) =>
  NO_FALLBACK_SKU_SEGMENTS.some((seg) => sku.includes(seg));

export function resolveModelOptions(sku) {
  if (!sku) return null;

  const options = {};
  let targetSku = sku; // Variable to hold the SKU currently being tested
  let frame = null;

  //  Remove -KIT extension (suppressed when a no-fallback segment is present)
  if (targetSku.includes("-KIT") && !hasNoFallbackSegment(targetSku)) {
    targetSku = targetSku.replace(/-KIT.*/, "");
  }

  // Remove Excess (more than 3 parts: Base-Suffix1-Suffix2-EXCESS)
  // Captures the first three segments to keep.
  const excessRemoveRegex = /^([A-Z0-9]+(-[A-Z0-9]+){2})(-.*)$/;

  if (excessRemoveRegex.test(targetSku)) {
    // Replace the full string with only the first three segments
    targetSku = targetSku.replace(excessRemoveRegex, "$1");
  }

  // --- STATIC FRAME PRIORITY MATCHING ---
  // Full Cleaned SKU Match (e.g., SW401-23-45)
  frame = data.frames.find((x) => targetSku === x.sku);

  if (!frame && !hasNoFallbackSegment(targetSku)) {
    // Shorter SKU Match — suppressed when a no-fallback segment is present
    // to avoid resolving down to a base SKU that has a 3D model but this
    // variant does not.
    const shorterSkuRegex = /^(.*)-[A-Z0-9]+$/;
    const shorterMatch = shorterSkuRegex.exec(targetSku);

    if (shorterMatch) {
      const shorterSku = shorterMatch[1];
      frame = data.frames.find((x) => shorterSku === x.sku);
    }
  }

  if (frame) {
    options.frame = frame;
    options.brand = data.brands.find((x) => x.id === frame.brandId);
    options.collection = frame.collection;
    options.materialType = frame.upholsteryFilter;
    options.staticFrame = frame.staticFrame;

    return options;
  }

  // --- 4. BYO FALLBACK (If no static frame found after all permutations) ---

  // For BYO, we use the original, non-permuted, but KIT-cleaned SKU.
  const [armSku, frameSku, backSku] = sku.split("-");

  const armType = data.collectionOptions.armTypes.find((a) => a.sku === armSku);

  if (!armType) return null; // bad arm part

  options.armType = armType;
  options.brand = data.brands.find((b) => b.id === armType.brandId);
  options.collection = armType.collection;

  const frameByo = data.frames.find(
    (f) =>
      f.sku === frameSku &&
      f.brandId === options.brand.id &&
      f.collection === options.collection,
  );
  if (!frameByo) return null;

  options.frame = frameByo;
  options.staticFrame = false;
  options.materialType = frameByo.upholsteryFilter;

  if (backSku) {
    const backType = data.collectionOptions.backTypes.find(
      (b) => b.id === backSku,
    );
    if (!backType) return null; // bad back part
    options.backType = backType;
  }

  return options;
}

export function resolveTabOptions(options) {
  const tabs = {};

  if (!options.staticFrame) {
    tabs.popularConfigurations = data.popularConfigurations.filter(
      (pc) =>
        pc.brandId === options.brand?.id &&
        pc.collection === options.collection,
    );

    tabs.frames = data.frames.filter(
      (f) =>
        f.brandId === options.brand?.id && f.collection === options.collection,
    );

    tabs.baseTypes = data.collectionOptions.baseTypes.filter(
      (b) =>
        b.brandId === options.brand?.id && b.collection === options.collection,
    );

    tabs.stitchTypes = data.collectionOptions.stitchTypes.filter(
      (s) =>
        s.brandId === options.brand?.id && s.collection === options.collection,
    );
  }

  tabs.fabrics = data.fabrics;
  tabs.leathers = data.leathers;

  return Object.fromEntries(
    Object.entries(tabs).filter(([, val]) => {
      if (val === undefined) return false;
      if (Array.isArray(val) && val.length === 0) return false;
      return true;
    }),
  );
}
