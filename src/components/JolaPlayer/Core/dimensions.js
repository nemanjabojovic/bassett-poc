import {
  Box3,
  Vector3,
  MathUtils,
  Quaternion,
  BufferGeometry,
  LineBasicMaterial,
  Line,
  Euler,
} from "three";

import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";

import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";

const mToIn = (meters) => {
  return meters * 39.3701;
};

const calculateWidth = (from, to, direction, curved = false, modelObject) => {
  let width = 0;

  const lastIndex = modelObject.children.length - 1;

  let firstCornerSofa = isCornerSofa("left", modelObject);
  let lastCornerSofa = isCornerSofa("right", modelObject);

  for (let i = from; i <= to; i++) {
    const model = modelObject.children[i];
    let data = model.userData.model;

    const box = new Box3().setFromObject(model);
    const size = box.getSize(new Vector3());
    const bbDims = {
      width: Math.round(mToIn(size.x)),
      depth: Math.round(mToIn(size.z)),
      height: Math.round(mToIn(size.y)),
    };

    if (!data.dimensions) data.dimensions = bbDims;
    if (!data.dimensions.width) data.dimensions.width = bbDims.width;
    if (!data.dimensions.depth) data.dimensions.depth = bbDims.depth;
    if (!data.dimensions.height) data.dimensions.height = bbDims.height;

    const dataDims = data.dimensions;

    // recalculate corner dimensions
    const corner = data.corner;
    const cornerDims = calculateCornerDims(dataDims);

    const dimensions = corner ? cornerDims : dataDims;

    const rotation = Math.abs(model.rotation.y);
    const rotationDeg = MathUtils.radToDeg(rotation);
    const ERROR_OFFSET = 5; // deg

    let FACTOR = 1;

    if (from !== to) {
      switch (direction) {
        case "back":
          FACTOR = corner ? Math.sin(rotation) : Math.cos(rotation);

          if (corner && Math.abs(rotationDeg) < ERROR_OFFSET)
            FACTOR = Math.cos(rotation);
          if (i === lastIndex && lastCornerSofa) width += dimensions.depth;

          break;
        case "right":
          FACTOR = corner ? Math.cos(rotation) : Math.sin(rotation);

          if (
            (corner && Math.abs(rotationDeg - 90) < ERROR_OFFSET) ||
            (corner && i === 0)
          )
            FACTOR = Math.sin(rotation);

          if (
            (i === 0 && firstCornerSofa) ||
            (i === lastIndex &&
              lastCornerSofa &&
              Math.abs(rotationDeg) < ERROR_OFFSET)
          )
            width += dimensions.depth;

          break;

        case "front":
          FACTOR = corner && i === to ? Math.sin(rotation) : Math.cos(rotation);

          if (corner && Math.abs(rotationDeg) < ERROR_OFFSET)
            FACTOR = Math.cos(rotation);

          if (i === 0 && firstCornerSofa) width -= dimensions.width;
          if (
            i === lastIndex &&
            lastCornerSofa &&
            Math.abs(rotationDeg - 90) < ERROR_OFFSET
          )
            width += dimensions.depth;

          break;

        case "left":
          FACTOR = corner && i === to ? Math.cos(rotation) : Math.sin(rotation);

          if (corner && Math.abs(rotationDeg - 90) < ERROR_OFFSET)
            FACTOR = Math.sin(rotation);

          break;

        default:
          break;
      }
    }

    width += dimensions.width * FACTOR;

    if (curved && i === to && to === modelObject.children.length - 1) {
      const previous = modelObject.children[to - 1];

      const previousComponent = previous.getObjectByName("component_R");
      const componentRotation = previousComponent.rotation.y;

      const q = new Quaternion();
      model.getWorldQuaternion(q);
      const angle = new Euler().setFromQuaternion(model.quaternion, "YXZ").y;

      const x = Math.abs(componentRotation) + Math.abs(model.rotation.y);

      const dimensions = model.userData.model.dimensions;

      if (direction === "right" && MathUtils.radToDeg(angle) > -95)
        width += (dimensions.depth / Math.cos(componentRotation)) * Math.cos(x);
    }
  }

  return parseFloat(width.toFixed(1));
};

const isCornerSofa = (side = "left", model) => {
  const ERROR_OFFSET = 5; // deg

  const lastIndex = model.children.length - 1;
  const index = side === "right" ? lastIndex : 0;

  const componentL = model.children[index].getObjectByName("component_L");
  const componentR = model.children[index].getObjectByName("component_R");

  let componentAngle = 0,
    cornerSofa = false;

  if (side === "right") {
    if (componentL && !componentR) {
      componentAngle = MathUtils.radToDeg(componentL?.rotation.y || 0);
      cornerSofa = Math.abs(componentAngle - 90) < ERROR_OFFSET;
    }
  } else {
    if (!componentL && componentR) {
      componentAngle = MathUtils.radToDeg(componentR?.rotation.y || 0);
      cornerSofa = Math.abs(componentAngle + 90) < ERROR_OFFSET;
    }
  }

  return cornerSofa;
};

const addWidthLine = (
  from,
  to,
  direction,
  cornerSofa = false,
  curved = false,
  modelObject,
  dimensionsObject,
) => {
  const includeCornerSofa = cornerSofa && from === 0 && to !== 0;

  const LINE_OFFSET = 0.2;
  const LINE_WIDTH = 3;
  const LINE_COLOR = 0x000000;

  const box = new Box3().setFromObject(modelObject);

  // in case of corner sofa, dont include it in calculation of center
  const models = includeCornerSofa
    ? modelObject.children.slice(from, to + 2)
    : modelObject.children.slice(from, to + 1);
  const groupBox = new Box3();
  models.forEach((m) => groupBox.expandByObject(m));
  const size = groupBox.getSize(new Vector3());
  const center = groupBox.getCenter(new Vector3());

  const alongZ = ["left", "right"].includes(direction);

  const width = alongZ ? size.z : size.x;

  const geometry = new LineGeometry();
  geometry.setPositions([-width / 2, 0, 0, width / 2, 0, 0]);

  const material = new LineMaterial({
    color: LINE_COLOR,
    linewidth: LINE_WIDTH,
  });

  const line = new Line2(geometry, material);
  line.computeLineDistances();

  const linePos = new Vector3(center.x, box.max.y, center.z);
  const lineOffset = new Vector3();
  let ANGLE;
  switch (direction) {
    case "back":
    default:
      linePos.z = groupBox.min.z;
      lineOffset.z = LINE_OFFSET;
      ANGLE = -Math.PI / 2;
      break;
    case "right":
      linePos.x = groupBox.max.x;
      lineOffset.x = -LINE_OFFSET;
      ANGLE = Math.PI / 2;
      break;
    case "front":
      linePos.z = groupBox.max.z;
      lineOffset.z = -LINE_OFFSET;
      ANGLE = Math.PI / 2;
      break;
    case "left":
      linePos.x = groupBox.min.x;
      lineOffset.x = LINE_OFFSET;
      ANGLE = -Math.PI / 2;
      break;
  }

  line.name = `${direction} width line`;

  const position = linePos.sub(lineOffset);
  position.y = box.max.y;
  const rotY = alongZ ? Math.PI / 2 : 0;

  line.position.copy(position);
  line.rotation.set(0, rotY, 0);
  line.scale.set(1, 1, 1);

  dimensionsObject.add(line);

  // thin lines are connected to the width lines but rotated
  const yAxis = new Vector3(0, 1, 0);
  const rotationQuaternion = new Quaternion().setFromAxisAngle(yAxis, ANGLE);

  const lineQuaternion = new Quaternion();
  line.getWorldQuaternion(lineQuaternion);
  const thinLineQuaternion = lineQuaternion
    .clone()
    .multiply(rotationQuaternion);

  const thinLineOffset = new Vector3(width / 2, 0, 0).applyQuaternion(
    lineQuaternion,
  );
  const directionVector = new Vector3(width, 0, 0).applyQuaternion(
    lineQuaternion,
  );

  const startPoint = position.clone().sub(thinLineOffset);
  const endPoint = position.clone().add(directionVector).sub(thinLineOffset);

  addThinLine(startPoint, thinLineQuaternion, "", dimensionsObject);
  addThinLine(endPoint, thinLineQuaternion, "", dimensionsObject); // hide when its not 0 or 90

  // Labels
  const LABEL_OFFSET = 0.1;

  const widthCenter = new Vector3();
  const centerDirVector = new Vector3(0, LABEL_OFFSET, -LABEL_OFFSET);
  widthCenter.addVectors(startPoint, endPoint).divideScalar(2);
  const labelPosition = widthCenter.clone().add(centerDirVector);

  const widthValue = calculateWidth(from, to, direction, curved, modelObject);

  const label = createLabel(widthValue, labelPosition);
  label.name = `width label`;
  dimensionsObject.add(label);
};

const addSideLine = (
  model,
  type = "height",
  side = "right",
  modelObject,
  dimensionsObject,
) => {
  const LINE_OFFSET = 0.2;
  const LINE_WIDTH = 3;
  const LINE_COLOR = 0x000000;

  const configBox = new Box3().setFromObject(modelObject);
  const configSize = configBox.getSize(new Vector3());

  const box = new Box3().setFromObject(model);
  const center = box.getCenter(new Vector3());

  const dim = model.userData.bounding.size;

  const geometry = new LineGeometry();
  if (type === "height") geometry.setPositions([0, 0, 0, 0, configSize.y, 0]);
  else if (type === "depth") geometry.setPositions([0, 0, 0, 0, 0, dim.z]);

  const quaternion = new Quaternion();
  model.getWorldQuaternion(quaternion);

  const material = new LineMaterial({
    color: LINE_COLOR,
    linewidth: LINE_WIDTH,
  });

  const line = new Line2(geometry, material);
  line.name = `${side} ${type} line`;
  line.computeLineDistances();
  line.scale.set(1, 1, 1);

  const SIGN = side === "right" ? 1 : -1;
  const offset = new Vector3((dim.x / 2 + LINE_OFFSET) * SIGN, 0, -dim.z / 2);

  const position = offset.clone().applyQuaternion(model.quaternion).add(center);

  line.position.copy(position);
  line.position.y = box.min.y;

  line.quaternion.copy(model.quaternion);

  dimensionsObject.add(line);

  // Thin lines (next to height/depth)
  const yAxis = new Vector3(0, 1, 0);
  const ANGLE = side === "right" ? Math.PI : 0;
  const rotationQuaternion = new Quaternion().setFromAxisAngle(yAxis, ANGLE);
  const thinLineQuaternion = quaternion.clone().multiply(rotationQuaternion);

  const heightTop = new Vector3(position.x, configBox.max.y, position.z);
  const heightBottom = new Vector3(position.x, configBox.min.y, position.z);
  const directionVector = new Vector3(0, 0, dim.z).applyQuaternion(quaternion);
  const depthFront = heightBottom.clone().add(directionVector);
  if (type === "height") {
    addThinLine(heightTop, thinLineQuaternion, side, dimensionsObject);
    addThinLine(heightBottom, thinLineQuaternion, side, dimensionsObject);
  } else {
    addThinLine(depthFront, thinLineQuaternion, side, dimensionsObject);
  }

  // Labels
  const LABEL_OFFSET = 0.1;

  const dir = new Vector3(-LABEL_OFFSET, 0, 0);
  const labelDirection = dir.applyQuaternion(thinLineQuaternion);

  const heightCenter = new Vector3();
  heightCenter.addVectors(heightTop, heightBottom).divideScalar(2);
  const heightPos = heightCenter.clone().add(labelDirection);

  const depthCenter = new Vector3();
  depthCenter.addVectors(heightBottom, depthFront).divideScalar(2);
  const depthPos = depthCenter.clone().add(labelDirection);

  const heightValue = calculateHeight(modelObject);
  const depthValue = calculateDepth(model);

  const value = type === "height" ? heightValue : depthValue;
  const labelPosition = type === "height" ? heightPos : depthPos;

  const label = createLabel(parseFloat(value.toFixed(1)), labelPosition);
  label.name = `${side} ${type} label`;
  dimensionsObject.add(label);
};

const addThinLine = (
  position = new Vector3(),
  quaternion = new Quaternion(),
  side = "",
  dimensionsObject,
) => {
  const LINE_OFFSET = 0.2;

  const points = [];
  points.push(new Vector3(), new Vector3(LINE_OFFSET, 0, 0));

  let geometry = new BufferGeometry().setFromPoints(points);
  let material = new LineBasicMaterial({
    color: 0x000000,
  });

  let line = new Line(geometry, material);
  line.name = `${side} thin line`;
  line.computeLineDistances();

  line.position.copy(position);
  line.quaternion.copy(quaternion);
  line.scale.set(1, 1, 1);

  dimensionsObject.add(line);
};

const calculateHeight = (modelObject) => {
  let maxHeight = 0;

  modelObject.children.forEach((model) => {
    const dataDims = model.userData.model.dimensions;
    const height = dataDims.height;

    if (height > maxHeight) maxHeight = height;
  });

  return maxHeight;
};

const calculateTotalWidth = (model) => {
  let maxWidth = 0;
  const allWidths = widths(model);

  if (allWidths)
    allWidths.forEach((e) => {
      if (e.direction === "front" || e.direction === "back") {
        if (e.width > maxWidth) maxWidth = e.width;
      }
    });

  return maxWidth;
};
const calculateTotalDepth = (model) => {
  let maxDepth = 0;
  const allWidths = widths(model);

  if (allWidths.length > 1) {
    allWidths.forEach((e) => {
      if (e.direction === "left" || e.direction === "right") {
        if (e.width > maxDepth) maxDepth = e.width;
      }
    });
  } else {
    model.children.forEach((x) => {
      if (x.userData.model.dimensions) {
        const dataDims = x.userData.model.dimensions;
        const depth = dataDims.depth;

        if (depth > maxDepth) maxDepth = depth;
      }
    });
  }

  return maxDepth;
};

const widths = (model) => {
  const pairs = createPairs(model);
  const directions = ["back", "right", "front", "left"];

  const allWidths = [];

  const lastElement = model.children[model.children.length - 1];
  const lastRotation = MathUtils.radToDeg(lastElement.rotation.y);
  const curved = !(
    Math.abs(lastRotation) < 5 ||
    Math.abs(lastRotation - 90) < 5 ||
    Math.abs(lastRotation + 90) < 5
  );

  pairs.forEach(([from, to], index) => {
    if (!from) from = 0;

    const direction = directions[index % 4];

    const width = calculateWidth(from, to, direction, curved, model);

    allWidths.push({ direction, width });
  });

  return allWidths;
};

const createPairs = (model) => {
  const lastElement = model.children[model.children.length - 1];
  const lastRotation = MathUtils.radToDeg(lastElement.rotation.y);
  const curved = !(
    Math.abs(lastRotation) < 5 ||
    Math.abs(lastRotation - 90) < 5 ||
    Math.abs(lastRotation + 90) < 5
  );

  let cornerSofa = false;
  const ERROR_OFFSET = 5; // deg
  const componentR = model.children[0].getObjectByName("component_R");
  if (componentR) {
    const componentAngle = MathUtils.radToDeg(componentR?.rotation.y || 0);
    cornerSofa = Math.abs(componentAngle + 90) < ERROR_OFFSET;
  }

  // Rotations
  const rotations = [];
  model.children.forEach((model) => {
    const modelRotation = MathUtils.radToDeg(model.rotation.y);
    rotations.push(modelRotation);
  });

  // Corners
  const corners = [];
  const ANGLE = 80; // change of direction
  let lastCornerRotation = 0;
  for (let i = 1; i < rotations.length; i++) {
    const current = rotations[i];
    const diff = Math.abs(current - lastCornerRotation);

    if (diff >= ANGLE) {
      corners.push(i);
      lastCornerRotation = current;
    }
  }

  if (cornerSofa) {
    corners.shift();
    corners.unshift(0);
  }

  // Pairs
  const pairs = [];
  const lastIndex = model.children.length - 1;

  if (corners.length > 0) {
    const firstCorner = cornerSofa ? 0 : corners[0];

    pairs.push([0, firstCorner]); // first width

    for (let i = 0; i < corners.length - 1; i++) {
      const prev = corners[i - 1] || 0;
      const next = corners[i + 1] || lastIndex;

      pairs.push([prev, next]);
    }

    // prevent double width on single models
    if (model.children.length > 1)
      pairs.push([corners[corners.length - 2] || 0, lastIndex]); // last width
  } else pairs.push([0, lastIndex]);

  if (curved) pairs.push([corners[corners.length - 1], lastIndex]); // last width in curved configuration

  return pairs;
};

const calculateDepth = (model) => {
  const dataDims = model.userData.model.dimensions;

  // recalculate corner dimensions
  const corner = model.userData.model.corner;
  const cornerDims = calculateCornerDims(dataDims);
  const cornerDepth = cornerDims.depth;

  const depth = corner ? cornerDepth : dataDims.depth;

  return depth;
};

const calculateCornerDims = (dimensions) => {
  return {
    width: Math.round(dimensions.width / Math.sqrt(2)),
    height: dimensions.height,
    depth: Math.round(dimensions.width / Math.sqrt(2)),
  };
};

const createLabel = (value, position) => {
  const FONT_COLOR = "#141414";
  const FONT_LETTER_SPACING = "0.2px";

  const dimensions = document.createElement("div");
  dimensions.className = "dimensions";

  const p = document.createElement("p");
  p.innerText = value + '"';
  p.style.color = FONT_COLOR;
  p.style.letterSpacing = FONT_LETTER_SPACING;
  dimensions.append(p);

  const label = new CSS2DObject(p);
  label.position.copy(position);

  return label;
};

const groupDimensions = (leftDimensions, rightDimensions, dimensionsObject) => {
  dimensionsObject.children.forEach((dim) => {
    if (!dim.name.includes("width")) {
      if (dim.name.includes("left")) leftDimensions.push(dim);
      if (dim.name.includes("right")) rightDimensions.push(dim);
    }
  });
};

export const clearDimensions = (dimensionsObject, css2DRenderer) => {
  dimensionsObject.children = [];
  if (css2DRenderer) css2DRenderer.domElement.innerHTML = "";
};

export const sideDimensionsVisibility = (
  side,
  visible,
  leftDimensions,
  rightDimensions,
) => {
  if (!leftDimensions || !rightDimensions) return;

  const dimensions = side === "left" ? leftDimensions : rightDimensions;
  dimensions.forEach((dim) => (dim.visible = visible));
};

export const calculateDimensions = (model) => {
  const dimensions = { width: 0, height: 0, depth: 0 };

  if (model.children.length > 0) {
    dimensions.width = calculateTotalWidth(model);
    dimensions.height = calculateHeight(model);
    dimensions.depth = calculateTotalDepth(model);
  }

  return dimensions;
};

export const showDimensions = (
  model,
  dimensionsObject,
  leftDimensions,
  rightDimensions,
  camera,
) => {
  if (model.children.length === 0) return;

  dimensionsObject.clear();

  const firstElement = model.children[0];
  const lastElement = model.children[model.children.length - 1];

  model.children.forEach((model) => {
    const data = model.userData.model;

    const box = new Box3().setFromObject(model);
    const size = box.getSize(new Vector3());

    const dimensions = {
      width: Math.round(mToIn(size.x)),
      depth: Math.round(mToIn(size.z)),
      height: Math.round(mToIn(size.y)),
    };

    if (!data.dimensions) data.dimensions = dimensions;

    if (!data.dimensions.width) data.dimensions.width = dimensions.width;
    if (!data.dimensions.depth) data.dimensions.depth = dimensions.depth;
    if (!data.dimensions.height) data.dimensions.height = dimensions.height;
  });

  const lastRotation = MathUtils.radToDeg(lastElement.rotation.y);
  const curved = !(
    Math.abs(lastRotation) < 5 ||
    Math.abs(lastRotation - 90) < 5 ||
    Math.abs(lastRotation + 90) < 5
  );

  // Height lines
  addSideLine(firstElement, "height", "left", model, dimensionsObject);
  if (!curved)
    addSideLine(lastElement, "height", "right", model, dimensionsObject);

  // Depth lines
  addSideLine(firstElement, "depth", "left", model, dimensionsObject);
  if (!curved)
    addSideLine(lastElement, "depth", "right", model, dimensionsObject);

  // Long Width lines
  // Special case: Corner sofa is the first element
  let cornerSofa = false;
  const ERROR_OFFSET = 5; // deg
  const componentR = model.children[0].getObjectByName("component_R");
  if (componentR) {
    const componentAngle = MathUtils.radToDeg(componentR?.rotation.y || 0);
    cornerSofa = Math.abs(componentAngle + 90) < ERROR_OFFSET;
  }

  const rotations = [];
  model.children.forEach((model) => {
    const modelRotation = MathUtils.radToDeg(model.rotation.y);
    rotations.push(modelRotation);
  });

  const corners = [];
  const ANGLE = 80; // change of direction
  let lastCornerRotation = 0;
  for (let i = 1; i < rotations.length; i++) {
    const current = rotations[i];
    const diff = Math.abs(current - lastCornerRotation);

    if (diff >= ANGLE) {
      corners.push(i);
      lastCornerRotation = current;
    }
  }

  if (cornerSofa) {
    corners.shift();
    corners.unshift(0);
  }

  const pairs = createPairs(model);
  const directions = ["back", "right", "front", "left"];

  pairs.forEach(([start, end], index) => {
    if (!start) start = 0;

    const direction = directions[index % 4];

    if (!curved)
      addWidthLine(
        start,
        end,
        direction,
        cornerSofa,
        curved,
        model,
        dimensionsObject,
      );
    else {
      if (
        (direction === "back" && corners[corners.length - 1] !== end - 1) ||
        (direction === "right" && lastRotation > -90) ||
        (direction === "front" && lastRotation > 0)
      )
        addWidthLine(
          start,
          end,
          direction,
          cornerSofa,
          curved,
          model,
          dimensionsObject,
        );
    }
  });

  // Hide side dimensions
  groupDimensions(leftDimensions, rightDimensions, dimensionsObject);

  if (leftDimensions && rightDimensions) {
    const leftLine = leftDimensions.find((x) => x.name.includes("height line"));
    const rightLine = rightDimensions.find((x) =>
      x.name.includes("height line"),
    );

    if (leftLine && rightLine) {
      const closerLeft =
        camera.position.distanceTo(leftLine.position) <
        camera.position.distanceTo(rightLine.position);

      sideDimensionsVisibility(
        "left",
        closerLeft,
        leftDimensions,
        rightDimensions,
      );
      sideDimensionsVisibility(
        "right",
        !closerLeft,
        leftDimensions,
        rightDimensions,
      );
    }
  }
};
