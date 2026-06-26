import Core from "../Core";

import { RepeatWrapping, Vector3, RGBAFormat, Vector2, Box3 } from "three";

import TWEEN from "@tweenjs/tween.js/dist/tween.esm.js";

import { showDimensions, clearDimensions } from "../Core/dimensions.js";

export default class Player extends Core {
  constructor(containerId, options) {
    super(containerId, options);

    this.options = options;
    //informations extracted from this.options
    this.brand = options.brand;
    this.collection = options.collection;
    this.staticFrame = options.staticFrame;

    this.selectedFrame = options.frame;
    this.selectedPopularConfiguration = options.popularConfiguration;
    this.selectedArmType = options.armType;
    this.selectedEdgeType = options.edgeType || null;
    this.selectedBackType = options.backType;
    this.selectedBaseType = options.baseType;
    this.selectedStitchType = options.stitchType;

    this.selectedMaterialType = options.materialType;
    this.selectedFabric = options.fabric;
    this.selectedLeather = options.leather;
    this.selectedNailOptions = options.nailOptions;
    this.selectedFinish = options.finish;

    this.customShader = true;

    this.collectionLeg = null;

    this.blankNormal = this.createBlankTexture(64, 64, "normal");
    this.blankAO = this.createBlankTexture(64, 64, "ao");

    this.init();
  }

  //CONFIGURATION
  async setConfiguration(configuration) {
    this.modelConfiguration = configuration;

    await this.loadConfiguration();
  }

  async addConfiguration({ id, temp = false, side }) {
    // If it's first element it's not going to be temp
    if (this.modelConfiguration.elements.length === 0) {
      this.modelConfiguration.elements.push({ id: id, temp: temp });
    } else {
      // If we're adding temp element, check for pairing on both sides
      if (temp) {
        if (
          this.data.frames
            .find(
              (frame) =>
                frame.collection === this.collection &&
                frame.id === this.modelConfiguration.elements[0].id,
            )
            .pairing?.right?.includes(id)
        ) {
          this.modelConfiguration.elements.unshift({
            id: id,
            temp: temp,
          });
        }
        if (
          this.data.frames
            .find(
              (frame) =>
                frame.collection === this.collection &&
                frame.id ===
                  this.modelConfiguration.elements[
                    this.modelConfiguration.elements.length - 1
                  ].id,
            )
            .pairing?.left?.includes(id)
        )
          this.modelConfiguration.elements.push({
            id: id,
            temp: temp,
          });
      } else {
        if (side === "l") {
          this.modelConfiguration.elements.unshift({ id: id });
          this.lastAddedModelIndex = 0;
        } else if (side === "r") {
          this.modelConfiguration.elements.push({ id: id });
          this.lastAddedModelIndex =
            this.modelConfiguration.elements.length - 1;
        }
      }
    }

    await this.loadConfiguration();
  }

  async clearConfiguration() {
    this.modelConfiguration = { elements: [] };
    await this.loadConfiguration();
  }


  async loadFabric(fabric, materialName, updateTexture = true) {
    let promises = [];
    delete this.texLoaded;

    if (!fabric) {
      console.error("No fabric provided");
      return;
    }

    this.sheen = false;
    let targetedMaterials = [];
    let biasWelt = false;
    let biasRotation = Math.PI / 4;
    const DEFAULT_FABRIC_REPEAT = 1.4;
    const DEFAULT_LEATHER_REPEAT = 1;

    if (!fabric.type) {
      fabric.type = "leather";
    }

    if (this.applicationAreas.find((area) => area.dbValue === materialName)) {
      targetedMaterials = this.applicationAreas.find(
        (area) => area.dbValue === materialName,
      ).targetedMaterials;

      if (materialName === "BiasWelt") {
        biasWelt = true;
      }
    } else if (!Array.isArray(materialName)) {
      targetedMaterials.push(materialName);
    } else {
      targetedMaterials = materialName;
    }

    this.materials = this.materials.filter(
      (mat) => !targetedMaterials.includes(mat.name),
    );

    if (targetedMaterials) {
      for (const targetedMaterial of targetedMaterials) {
        let material = {
          name: targetedMaterial,
          type: fabric.type ? fabric.type : "null",
          userData: fabric,
          repeat:
            fabric.repeatWidth && fabric.repeatHeight
              ? new Vector2(fabric.repeatWidth, fabric.repeatHeight)
              : null,
        };

        if (fabric?.type === "Leather" || fabric?.type === "Fabric") {
          this.selectedMaterialType = fabric.type;
        }

        function findCurrentRepeat() {
          let result;
          if (material.repeat) {
            result = material.repeat;
          } else {
            if (fabric.type === "Fabric") {
              result = DEFAULT_FABRIC_REPEAT;
            } else {
              result = DEFAULT_LEATHER_REPEAT;
            }
          }

          return result;
        }

        let mapRepeat = findCurrentRepeat();

        if (fabric.map) {
          let promise = this.loadTexture(fabric.map).then((map) => {
            if (map) {
              map.format = RGBAFormat;
              map.wrapS = RepeatWrapping;
              map.wrapT = RepeatWrapping;
              map.flipY = false;
              map.anisotropy = this.renderer.capabilities.getMaxAnisotropy();

              map.rotation = biasWelt ? biasRotation : 0;

              if (mapRepeat) map.repeat.set(mapRepeat.x, mapRepeat.y);

              material.map = map;
            }
          });

          promises.push(promise);
        }

        if (fabric.normalMap || !fabric.normalMap) {
          let promise = (
            !fabric.normalMap
              ? Promise.resolve(this.blankNormal)
              : this.loadTexture(fabric.normalMap)
          ).then((normalMap) => {
            if (normalMap) {
              normalMap.wrapS = RepeatWrapping;
              normalMap.wrapT = RepeatWrapping;
              normalMap.flipY = false;
              normalMap.anisotropy = this.renderer.capabilities.getMaxAnisotropy();

              normalMap.rotation = biasWelt ? biasRotation : 0;

              if (!fabric.map && fabric.repeatHeight)
                normalMap.repeat = material.repeat;

              material.normalMap = normalMap;
            }
          });

          promises.push(promise);
        }

        if (fabric.roughnessMap) {
          let promise = this.loadTexture(fabric.roughnessMap).then(
            (roughnessMap) => {
              if (roughnessMap) {
                roughnessMap.wrapS = RepeatWrapping;
                roughnessMap.wrapT = RepeatWrapping;
                roughnessMap.flipY = false;
                roughnessMap.anisotropy = this.renderer.capabilities.getMaxAnisotropy();

                roughnessMap.rotation = biasWelt ? biasRotation : 0;

                roughnessMap.repeat.set(mapRepeat, mapRepeat);

                material.roughnessMap = roughnessMap;
              }
            },
          );

          promises.push(promise);
        }

        if (fabric.roughness) material.roughness = fabric.roughness;
        if (fabric.metalness) material.metalness = fabric.metalness;

        if (fabric.aoMap) {
          let promise = this.loadTexture(fabric.aoMap).then((aoMap) => {
            if (aoMap) {
              aoMap.wrapS = RepeatWrapping;
              aoMap.wrapT = RepeatWrapping;
              aoMap.anisotropy = this.renderer.capabilities.getMaxAnisotropy();

              aoMap.rotation = biasWelt ? biasRotation : 0;

              aoMap.repeat.set(fabric.repeat || 1, fabric.repeat || 1);

              material.aoMap = aoMap;
            }
          });

          promises.push(promise);
        }

        if (fabric.sheen) material.sheen = fabric.sheen;
        if (fabric.sheenRoughness != null) material.sheenRoughness = fabric.sheenRoughness;

        if (fabric.sheenColor) {
          //Added failsafe in case of string contains whitespaces
          //Note remove after all upholstery fabrics/leathers have been produced
          if (/\s/.test(fabric.sheenColor)) {
            console.warn(
              `Sheen color: "Upholstery ${
                fabric.name
              }" color value contains spaces -> "${fabric.sheenColor}"`,
            );
          }
          material.sheenColor = fabric.sheenColor.trim();
        }

        if (fabric.sheenColorMap) {
          let promise = this.loadTexture(fabric.sheenColorMap).then(
            (sheenColorMap) => {
              if (sheenColorMap) {
                sheenColorMap.wrapS = RepeatWrapping;
                sheenColorMap.wrapT = RepeatWrapping;
                sheenColorMap.flipY = false;

                material.sheenColorMap = sheenColorMap;
              }
            },
          );

          promises.push(promise);
        }

        material.colorCorrection = this.checkColorCorrection(fabric);
        this.materials.push(material);
      }
    }

    if (this.loadingScreen) {
      this.loadingScreen.style.display = "block";
      this.setModelLoading(true);
    }

    await Promise.all(promises);
    this.texLoaded = true;

    if (updateTexture) this.updateTexture();

    if (this.loadingScreen && this.texLoaded && this.modelLoaded) {
      this.loadingScreen.style.display = "none";
      this.setModelLoading(false);
    }
  }

  async loadFinish(finish) {
    await this.loadFabric(finish, "wood");
  }


  async setArmType(armTypeData) {
    this.selectedArmType = armTypeData;
    this.updateModel();

    this.setAvailableApplicationAreas();
  }

  setEdgeType(edgeTypeData) {
    this.selectedEdgeType = edgeTypeData;
    this.updateModel();
  }

  setMaterialType(type) {
    this.selectedMaterialType = type;
    this.updateModel();
    this.loadConfiguration();
  }

  setLocalization(input = "en-US") {
    this.localization = input;

    clearDimensions(this.dimensions, this.css2DRenderer);
    if (this.dimensionsVisible)
      showDimensions(
        this.model,
        this.dimensions,
        this.leftDimensions,
        this.rightDimensions,
        this.camera,
      );
  }

  getDimensions() {
    return this.currentDimensions;
  }

  setDimensionsVisible(value) {
    this.dimensionsVisible = value;
    clearDimensions(this.dimensions, this.css2DRenderer);
    if (this.dimensionsVisible) {
      showDimensions(
        this.model,
        this.dimensions,
        this.leftDimensions,
        this.rightDimensions,
        this.camera,
      );
    }
    this.requestRender();
  }

  //ANIMATION
  hasAnimation() {
    return this.animations && this.animations.length > 0;
  }

  playAnimation() {
    this._isAnimationPlaying = true;
    this.animations.forEach((animation) => {
      animation.play();
      animation.paused = false;

      animation.timeScale *= -1;
    });

    var self = this;
    this.mixer.addEventListener("finished", function onFinished() {
      self._isAnimationPlaying = false;
      self.mixer.removeEventListener("finished", onFinished);
    });
  }

  toggleAnimation() {
    if (!this.animations?.length) return

    const isPaused = this.animations[0].paused

    if (isPaused) {
      this.animations.forEach((animation) => {
        animation.paused = false
      })
      this._isAnimationPlaying = true
    } else if (this._isAnimationPlaying) {
      this.animations.forEach((animation) => {
        animation.paused = true
      })
      this._isAnimationPlaying = false
    } else {
      this.playAnimation()
    }
  }

  //UPDATERS
  updateCameraPosition(preset = "default", firstLoad = false) {
    this.controls.minAzimuthAngle = Infinity;
    this.controls.maxAzimuthAngle = Infinity;
    this.controls.maxPolarAngle = Math.PI / 2;

    let oldTarget = this.controls.target.clone();

    let box = new Box3().setFromObject(this.model);
    let size = box.getSize(new Vector3());
    let length = size.length();
    let center = box.getCenter(new Vector3());

    if (this.plane) {
      this.plane.position.y = box.min.y;
      if (this.shadowPlane) this.shadowPlane.position.y = box.min.y;
    }

    const MIN_DISTANCE_MULTIPLIER = 0.75;
    let MAX_DISTANCE_MULTIPLIER;

    MAX_DISTANCE_MULTIPLIER = 0.8;
    if (this.isMobile) MAX_DISTANCE_MULTIPLIER = 2.2;

    let minCameraDistance = length * MIN_DISTANCE_MULTIPLIER;
    let maxCameraDistance = length * MAX_DISTANCE_MULTIPLIER;

    if (maxCameraDistance < 5) maxCameraDistance = 5;

    let cameraStartPosition = {
      x: this.camera.position.x,
      y: this.camera.position.y,
      z: this.camera.position.z,
    };

    let newTarget = center.clone();
    let newPosition = new Vector3();

    // zoom variables
    let dir = new Vector3();
    this.camera.getWorldDirection(dir);
    dir.negate();

    let zoomFactor = 0.8,
      currentDistance = this.camera.position.distanceTo(this.controls.target),
      zoomedDistance;

    let stopZoom = false;
    const ERROR_OFFSET = 0.0001;

    let firstModelBoundingBox;
    if (this.model.children[0])
      firstModelBoundingBox = new Box3().setFromObject(this.model.children[0]);

    let fov = (this.camera.fov * Math.PI) / 180;
    let fovh = 2 * Math.atan(Math.tan(fov / 2) * this.camera.aspect);

    let dx = size.z / 2 + Math.abs(size.x / 2 / Math.tan(fovh / 2));
    let dy = size.z / 2 + Math.abs(size.y / 2 / Math.tan(fov / 2));

    let cameraZ = Math.max(dx, dy);

    let horizontalDegrees = -30,
      verticalDegrees = 25;

    // radians
    let horizontalAngle = (Math.PI / 180) * horizontalDegrees,
      verticalAngle = (Math.PI / 180) * verticalDegrees;

    const ratio = size.z / size.x;
    let distanceFactor = ratio < 2 ? 1.4 : 1.7;

    switch (preset) {
      case "default":
        let cameraPosition = new Vector3(
          distanceFactor * cameraZ * Math.sin(horizontalAngle),
          distanceFactor * cameraZ * Math.tan(verticalAngle),
          distanceFactor * cameraZ * Math.cos(horizontalAngle),
        );

        if (this.model.children.length === 0) cameraPosition.set(0, 4, 0);

        newPosition.copy(cameraPosition);

        break;

      case "top":
        this.controls.minPolarAngle = 0;
        this.controls.maxDistance = 20;

        let top_dx = size.y / 2 + Math.abs(size.x / 2 / Math.tan(fovh / 2));
        let top_dz = size.y / 2 + Math.abs(size.z / 2 / Math.tan(fov / 2));
        let cameraY = Math.max(top_dx, top_dz);

        let heightFactor = 1;
        if (this.model.children.length <= 2) heightFactor = 2.6;
        else if (this.model.children.length === 3) heightFactor = 2;
        else heightFactor = 1.7;

        newPosition.set(center.x, heightFactor * cameraY, center.z);
        newTarget = new Vector3(center.x, size.y, center.z - 0.01);

        if (this.model.children.length === 0) newPosition.set(0, 9, 0);

        break;

      case "front":
        newPosition.set(center.x, center.y, size.z / 2 + cameraZ);

        break;

      case "left":
        let left_dx = size.x / 2 + Math.abs(size.x / 2 / Math.tan(fovh / 2));
        let left_dz = size.x / 2 + Math.abs(size.z / 2 / Math.tan(fov / 2));
        let cameraXleft = Math.max(left_dx, left_dz);

        newPosition.set(-(size.x / 2 + cameraXleft), center.y, center.z);

        break;

      case "right":
        let right_dx = size.x / 2 + Math.abs(size.x / 2 / Math.tan(fovh / 2));
        let right_dz = size.x / 2 + Math.abs(size.z / 2 / Math.tan(fov / 2));
        let cameraXright = Math.max(right_dx, right_dz);

        newPosition.set(size.x / 2 + cameraXright, center.y, center.z);

        break;

      case "zoom-in":
        stopZoom = Math.abs(currentDistance - minCameraDistance) < ERROR_OFFSET;

        if (currentDistance - minCameraDistance > zoomFactor)
          zoomedDistance = currentDistance * zoomFactor;
        else
          zoomedDistance = Math.max(
            this.controls.minDistance,
            currentDistance - zoomFactor,
          );

        newPosition
          .copy(this.controls.target)
          .addScaledVector(dir, zoomedDistance);
        break;

      case "zoom-out":
        stopZoom = Math.abs(maxCameraDistance - currentDistance) < ERROR_OFFSET;

        if (maxCameraDistance - currentDistance > zoomFactor)
          zoomedDistance = currentDistance / zoomFactor;
        else
          zoomedDistance = Math.min(
            this.controls.maxDistance,
            currentDistance + zoomFactor,
          );

        newPosition
          .copy(this.controls.target)
          .addScaledVector(dir, zoomedDistance);
        break;

      case "legs":
        let frontLeftPosition = new Vector3(
          firstModelBoundingBox.min.x,
          firstModelBoundingBox.min.y,
          firstModelBoundingBox.max.z,
        );

        newTarget = frontLeftPosition;

        newPosition.copy(
          new Vector3(
            frontLeftPosition.x - 0.5,
            frontLeftPosition.y + 0.2,
            frontLeftPosition.z + 1,
          ),
        );

        break;

      case "nails":
        let topLeftPosition = new Vector3();

        let targetCurve = null;
        let worldPosition = new Vector3();

        let curveBoundingBox = new Box3();

        let modelWithNails = this.model.children.find((x) =>
          x.getObjectByProperty("type", "LineSegments"),
        );

        let curveName;

        if (!modelWithNails) return;
        else
          modelWithNails.traverse((child) => {
            if (
              child.name.includes("curve") &&
              child.name.includes(curveName)
            ) {
              let currentWorldPosition = child.getWorldPosition(
                worldPosition.clone(),
              );

              if (targetCurve === null) targetCurve = child;
              else {
                if (!targetCurve.visible) return;

                let targetWorldPosition = targetCurve.getWorldPosition(
                  worldPosition.clone(),
                );

                if (
                  currentWorldPosition.z > targetWorldPosition.z ||
                  (currentWorldPosition.z === targetWorldPosition.z &&
                    currentWorldPosition.y > targetWorldPosition.y) ||
                  (currentWorldPosition.z === targetWorldPosition.z &&
                    currentWorldPosition.y === targetWorldPosition.y &&
                    currentWorldPosition.x < targetWorldPosition.x)
                )
                  targetCurve = child;
              }
            }
          });

        if (targetCurve) {
          curveBoundingBox = new Box3().setFromObject(targetCurve);

          topLeftPosition = new Vector3(
            curveBoundingBox.min.x,
            curveBoundingBox.max.y,
            curveBoundingBox.max.z,
          );
        }

        if (!topLeftPosition || topLeftPosition.equals(new Vector3()))
          topLeftPosition = new Vector3(
            firstModelBoundingBox.min.x,
            firstModelBoundingBox.min.y + 0.04,
            firstModelBoundingBox.max.z,
          );

        newTarget = topLeftPosition;

        if (topLeftPosition) {
          newPosition.copy(
            new Vector3(
              topLeftPosition.x - 0.25,
              topLeftPosition.y + 0.05,
              topLeftPosition.z + 0.25,
            ),
          );
        }

        break;

      case "arms":
        // TODO - refactor
        const firstModel = this.model.children[0]?.userData.model;
        const lastModel =
          this.model.children[this.model.children.length - 1]?.userData.model;

        let frontLeftPositionArm;
        let modelBoundingBoxArm;

        let armCenter;
        if (!firstModel.pairing || !firstModel.pairing.left) {
          modelBoundingBoxArm = new Box3().setFromObject(
            this.model.children[0],
          );
          armCenter = modelBoundingBoxArm.getCenter(new Vector3());

          frontLeftPositionArm = new Vector3(
            modelBoundingBoxArm.min.x,
            armCenter.y,
            modelBoundingBoxArm.max.z,
          );

          newPosition.copy(
            new Vector3(
              frontLeftPositionArm.x - 0.5,
              frontLeftPositionArm.y + 0.2,
              frontLeftPositionArm.z + 1,
            ),
          );
        } else {
          if (!lastModel.pairing.right) {
            modelBoundingBoxArm = new Box3().setFromObject(
              this.model.children[this.model.children.length - 1],
            );
            armCenter = modelBoundingBoxArm.getCenter(new Vector3());

            frontLeftPositionArm = new Vector3(
              modelBoundingBoxArm.max.x,
              armCenter.y,
              modelBoundingBoxArm.max.z,
            );

            newPosition.copy(
              new Vector3(
                frontLeftPositionArm.x + 0.5,
                frontLeftPositionArm.y + 0.2,
                frontLeftPositionArm.z + 1,
              ),
            );
          } else {
            return;
          }
        }

        newTarget = frontLeftPositionArm;
        break;

      case "back":
        let modelBoundingBoxBack = new Box3();
        // TODO - better way - world position
        modelBoundingBoxBack = new Box3().setFromObject(this.model.children[0]);

        let backCenter = modelBoundingBoxBack.getCenter(new Vector3());

        let frontLeftPositionBack = new Vector3(
          backCenter.x,
          backCenter.y,
          backCenter.z,
        );

        newTarget = frontLeftPositionBack;

        newPosition.copy(
          new Vector3(
            modelBoundingBoxBack.min.x - 0.8,
            frontLeftPositionBack.y + 1,
            modelBoundingBoxBack.max.z + 1,
          ),
        );

        break;

      default:
        console.error(`Unknown preset: ${preset}`);

        break;
    }

    if (firstLoad) {
      this.camera.position.copy(newPosition);

      this.controls.target.copy(newTarget);
      this.controls.enableZoom = true;
      this.controls.enableRotate = true;
    } else {
      this.controls.enabled = false;
      this.freeControls();

      let draggingSpeed;
      if (
        ((preset === "zoom-in" || preset === "zoom-out") && stopZoom) ||
        firstLoad
      ) {
        draggingSpeed = 0;
      } else if (this.isDragging) {
        draggingSpeed = this.tweenDurationDND;
      } else {
        draggingSpeed = 800;
      }

      new TWEEN.Tween(oldTarget)
        .to(newTarget, draggingSpeed)
        .easing(TWEEN.Easing.Sinusoidal.InOut)
        .onUpdate((result) => {
          this.controls.target.copy(result);
        })
        .start();

      let goToTarget = new TWEEN.Tween(cameraStartPosition)
        .to(newPosition, draggingSpeed)
        .easing(TWEEN.Easing.Sinusoidal.InOut)
        .onUpdate((result) => {
          this.camera.position.set(result.x, result.y, result.z);
        });

      goToTarget.start().onComplete(async () => {
        this.controls.enableZoom = true;
        this.controls.enableRotate = true;
      });

      if (!this.draggedObject) this.controls.enabled = true;

      // this.controls.minDistance = minCameraDistance;
      this.controls.enablePan = false;
      this.controls.maxPolarAngle = Math.PI / 2;

      this.controls.maxPolarAngle = Math.PI / 2;

      if (preset === "front" || preset === "default") {
        this.controls.minPolarAngle = 0.8;
        this.controls.minDistance = minCameraDistance;
      }

      if (preset === "zoom-in" || preset === "zoom-out") {
        this.controls.minDistance = minCameraDistance;
        this.controls.maxDistance = 20;
      }

      stopZoom = true;
    }

    if (this.dimensionsVisible) {
      showDimensions(
        this.model,
        this.dimensions,
        this.leftDimensions,
        this.rightDimensions,
        this.camera,
      );
    }

    this.controls.update();
  }

  setSwapElement(newModel) {
    const index = this.swap.index;
    const id = newModel.id;

    if (this.modelConfiguration.elements[index])
      this.modelConfiguration.elements[index] = { id };

    this.loadConfiguration();

    this.swap = null;
    this.setSwapCompleted();
  }

  cancelSwap() {
    this.swap = null;
    this.setSwapCompleted();
  }

  getSwapState() {
    return this.swap;
  }

  resize() {
    const canvas = this.renderer.domElement;
    const pixelRatio = window.devicePixelRatio;
    const width = canvas.clientWidth * pixelRatio || 0;
    const height = canvas.clientHeight * pixelRatio || 0;
    const needResize = canvas.width !== width || canvas.height !== height;

    if (needResize) {
      this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
      if (this.model.children.length > 0) this.updateCameraPosition();
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(
        this.container.clientWidth,
        this.container.clientHeight,
        true,
      );

      if (this.css2DRenderer) {
        this.css2DRenderer.setSize(
          this.container.clientWidth,
          this.container.clientHeight,
          true,
        );
      }

      this.requestRender();
    }
  }

  setEditSelected(value) {
    this.editSelected = value;

    if (!value) {
      this.clearSelected();
    }
    this.requestRender();
  }

  dispose() {
    if (this._rafId != null) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }

    if (typeof TWEEN.removeAll === "function") {
      TWEEN.removeAll();
    } else if (typeof TWEEN.getAll === "function") {
      TWEEN.getAll().forEach((tween) => TWEEN.remove(tween));
    }

    window.removeEventListener("resize", this.resizeBound, false);
    this.container.removeEventListener(
      "mousemove",
      this.onMouseMoveBound,
      false,
    );
    this.container.removeEventListener(
      "touchmove",
      this.onMouseMoveBound,
      false,
    );

    this.container.removeEventListener("mouseup", this.onDragEndBound, false);
    this.container.removeEventListener(
      "mousedown",
      this.onMouseClickBound,
      false,
    );

    if (this.mixer) {
      this.mixer.stopAllAction();
    }

    this.scene.traverse((obj) => {
      if (obj.geometry) {
        obj.geometry.dispose();
      }
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => this.disposeMaterial(m));
        } else {
          this.disposeMaterial(obj.material);
        }
      }
    });

    if (this.renderTarget) this.renderTarget.dispose();

    if (this.hdrTexture) {
      this.hdrTexture.dispose();
      this.hdrTexture = null;
      this.scene.environment = null;
    }

    if (this.loadedTextures) {
      this.loadedTextures.forEach((texture) => texture.dispose());
      this.loadedTextures = null;
    }

    this.blankNormal?.dispose();
    this.blankNormal = null;
    this.blankAO?.dispose();
    this.blankAO = null;

    if (this.controls?.dispose) this.controls.dispose();

    if (this.dracoLoader) {
      this.dracoLoader = null;
    }

    if (this.gltfLoader) {
      this.gltfLoader = null;
    }

    if (this.renderer) {
      this.renderer.dispose();
      const canvas = this.renderer.domElement;
      if (canvas?.parentNode) canvas.parentNode.removeChild(canvas);
    }

    if (this.css2DRenderer?.dispose) this.css2DRenderer.dispose();

    if (this.stats?.dom?.parentNode) {
      this.stats.dom.parentNode.removeChild(this.stats.dom);
    }

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.mixer = null;
    this.css2DRenderer = null;
    this.stats = null;
    this.renderTarget = null;
    this.dracoLoader = null;
    this.gltfLoader = null;
    this.textureLoader = null;
    this.loadedModels = null;
    this.loadedArms = null;
    this.loadedNails = null;
    this.spaces = null;
  }
}
