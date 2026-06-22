import {
  Box3,
  Group,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  ShaderMaterial,
  Vector3,
  WebGLRenderTarget,
} from "three";

import { HorizontalBlurShader } from "three/examples/jsm/shaders/HorizontalBlurShader.js";
import { VerticalBlurShader } from "three/examples/jsm/shaders/VerticalBlurShader.js";

let blurPlane, horizontalBlurMaterial, verticalBlurMaterial;

export const contactShadow = (
  model,
  scene,
  floorPlane,
  shadowGroup,
  renderTarget,
  camera,
) => {
  scene.children.forEach((x) => {
    if (x.name === "Shadow Group") scene.remove(x);
  });

  const group = new Group();
  group.name = "Shadow Group";
  scene.add(group);

  const bbox = new Box3().setFromObject(model);

  const SHADOW_OFFSET = 5;
  const WIDTH = bbox.getSize(new Vector3()).x * SHADOW_OFFSET;
  const CAMERA_HEIGHT = bbox.max.y;

  const OPACITY = 0.5;

  // shadow plane
  const geometry = new PlaneGeometry(WIDTH, WIDTH).rotateX(Math.PI / 2);
  const material = new MeshBasicMaterial({
    color: 0x000000,
    map: renderTarget.texture,
    opacity: OPACITY,
    transparent: true,
    depthWrite: false,
  });

  const plane = new Mesh(geometry, material);
  plane.name = "Shadow Plane";
  plane.renderOrder = 1;
  plane.scale.y = -1;
  plane.position.y = bbox.min.y + 0.001;

  // blur plane
  blurPlane = new Mesh(geometry);
  blurPlane.name = "Blur Plane";
  blurPlane.visible = false;

  // fill plane
  const fillPlane = floorPlane;

  // orthographic camera
  camera.left = -WIDTH / 2;
  camera.right = WIDTH / 2;
  camera.top = WIDTH / 2;
  camera.bottom = -WIDTH / 2;
  camera.near = 0;
  camera.far = CAMERA_HEIGHT;

  camera.rotation.x = Math.PI / 2; // look up

  camera.updateProjectionMatrix();

  if (fillPlane) group.add(plane, blurPlane, fillPlane, camera);
  else group.add(plane, blurPlane, camera);

  shadowGroup.children = group.children;

  // horizontal blur
  horizontalBlurMaterial = new ShaderMaterial(HorizontalBlurShader);
  horizontalBlurMaterial.depthTest = false;

  // vertical blur
  verticalBlurMaterial = new ShaderMaterial(VerticalBlurShader);
  verticalBlurMaterial.depthTest = false;
};

let renderTargetBlur;

export const blurShadow = (amount, renderTarget, camera, renderer) => {
  if (!renderTargetBlur) {
    const RES = renderTarget.width;
    renderTargetBlur = new WebGLRenderTarget(RES, RES);
    renderTargetBlur.texture.generateMipmaps = false;
  }

  if (blurPlane) {
    blurPlane.visible = true;

    // blur horizontally
    blurPlane.material = horizontalBlurMaterial;
    blurPlane.material.uniforms.tDiffuse.value = renderTarget.texture;
    horizontalBlurMaterial.uniforms.h.value = (amount * 1) / 256;

    renderer.setRenderTarget(renderTargetBlur);
    if (blurPlane) renderer.render(blurPlane, camera);

    // blur vertically
    blurPlane.material = verticalBlurMaterial;
    blurPlane.material.uniforms.tDiffuse.value = renderTargetBlur.texture;
    verticalBlurMaterial.uniforms.v.value = (amount * 1) / 256;

    renderer.setRenderTarget(renderTarget);
    if (blurPlane) renderer.render(blurPlane, camera);

    blurPlane.visible = false;
  }
};
