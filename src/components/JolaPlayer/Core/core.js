import {
  AmbientLight,
  Box3,
  Clock,
  DataTexture,
  Texture,
  Color,
  DirectionalLight,
  Euler,
  Group,
  Mesh,
  NoToneMapping,
  PerspectiveCamera,
  Plane,
  PlaneGeometry,
  Quaternion,
  Raycaster,
  RepeatWrapping,
  Scene,
  ShadowMaterial,
  SpotLight,
  TextureLoader,
  Vector2,
  Vector3,
  WebGLRenderer,
  MeshPhysicalMaterial,
  AnimationMixer,
  WebGLRenderTarget,
  OrthographicCamera,
  PCFSoftShadowMap,
  SRGBColorSpace,
  MeshStandardMaterial,
  RGBAFormat,
  UnsignedByteType,
  NearestFilter,
  LoopOnce,
  CameraHelper,
  DirectionalLightHelper,
  SpotLightHelper,
  EquirectangularReflectionMapping,
  InstancedMesh,
  Object3D,
  SphereGeometry,
} from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { HDRLoader } from "three/examples/jsm/loaders/HDRLoader.js";

import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";

import Stats from "three/examples/jsm/libs/stats.module.js";

import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";

import {
  CSS2DRenderer,
  CSS2DObject,
} from "three/examples/jsm/renderers/CSS2DRenderer.js";

import applicationAreas from "../applicationAreas.json";

import TWEEN from "@tweenjs/tween.js/dist/tween.esm.js";

import { LIGHT_PRESETS } from "../lightPresets.js";
import { DEVICE_PRESETS } from "../devicePresets.js";

import {
  calculateDimensions,
  showDimensions,
  sideDimensionsVisibility,
  clearDimensions,
} from "./dimensions.js";

import { contactShadow, blurShadow } from "./contactShadow.js";


export default class Core {
  constructor(containerId, options) {
    this.cache = options?.cache || false;

    this.setContainer(containerId);
    this.isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    this.isLowEnd = this.isLowEndGPU();

    if (this.isMobile) this.preset = DEVICE_PRESETS.mobile;
    else if (this.isLowEnd) this.preset = DEVICE_PRESETS.lowEnd;
    else this.preset = DEVICE_PRESETS.highEnd;

    this.defaultSceneOptions = {
      lights: LIGHT_PRESETS[options.brand?.id] || LIGHT_PRESETS["default"],
      controls: {
        enableZoom: true,
        enablePan: true,
      },
      camera: {
        fov: 20,
      },

      renderer: {
        shadowMap: {
          type: PCFSoftShadowMap,
        },
      },
      scene: {
        background: new Color(0xeeeff2),
      },
    };

    this.resourcesPath = "./resources";

    this.loadedConfigurationMaps = [];

    this.sceneOptions = options?.sceneOptions || this.defaultSceneOptions;

    this.createScene();

    try {
      this.createRenderer();
    } catch (e) {
      console.error("WebGL initialization failed:", e);
      this.webglFailed = true;
      return;
    }

    this.createCSS2DRenderer();
    this.createCamera();
    this.createControls();
    this.lights = new Group();
    this.scene.add(this.lights);
    this.createLights();

    this.model = new Group();
    this.model.name = "model";
    this.scene.add(this.model);

    this.modelConfiguration = { elements: [] };

    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath(`${this.resourcesPath}/draco/`);

    this.gltfLoader = new GLTFLoader();
    this.gltfLoader.setDRACOLoader(this.dracoLoader);

    this.loadingScreen = document.getElementById(
      options.loadingScreenId || "loading-screen",
    );

    this.textureLoader = new TextureLoader();

    this.data = options.data;
    this.applicationAreas = applicationAreas.materialApplicationAreas;

    this.materials = [];
    this.loadedTextures = [];
    this.loadedModels = [];
    this.loadedArms = [];

    this.dimensionsVisible = false;
    this.dimensions = new Group();
    this.scene.add(this.dimensions);

    // contact shadow (render target allocated lazily on first use)
    this.shadowGroup = new Group();
    this.shadowGroup.name = "Shadow Group";
    this.scene.add(this.shadowGroup);
    this.renderTarget = null;
    this.shadowCamera = new OrthographicCamera();

    this.leftDimensions = [];
    this.rightDimensions = [];

    this.buttons = new Group();

    this.isRunning = false;

    this.localization = this.sceneOptions.localization || "en-US";

    this.clock = new Clock();
    this.targetFPS = this.preset.targetFPS || 60;
    this.frameInterval = 1 / this.targetFPS;
    this.frameDelta = 0;
    this.needsRender = true;
    this._renderFrames = 0;
    this.needsShadowUpdate = true;
    this.mouse = new Vector2();

    this.raycaster = new Raycaster();
    this.raycasterVector = new Vector3();
    this.raycasterPlane = new Plane(new Vector3(0, 1, 0), 0);

    this.animations = [];
    this.animationSpeed = 1;

    //DRAG AND DROP CONSTANTS
    this.spaces = new Group();
    this.scene.add(this.spaces);

    this.tweenDurationDND = 500;

    this.draggedObjectIndex = -1;
    this.leftArr = [];
    this.rightArr = [];
    this.spacesID = 0;
    this.executed = false;

    this.collectionMaps = null;

    this.update = this.update.bind(this);
    this._rafId = requestAnimationFrame(this.update.bind(this));

    this.resizeBound = this.resize.bind(this);
    this.onMouseMoveBound = this.onMouseMove.bind(this);
    this.onDragEndBound = this.onDragEnd.bind(this);
    this.onMouseClickBound = this.onMouseClick.bind(this);

    window.addEventListener("resize", this.resizeBound, false);
    this.container.addEventListener("mousemove", this.onMouseMoveBound, false);

    if (this.preset.touchMoveListener)
      this.container.addEventListener(
        "touchmove",
        this.onMouseMoveBound,
        false,
      );

    this.container.addEventListener("mouseup", this.onDragEndBound, false);

    this.container.addEventListener("mousedown", this.onMouseClickBound, false);

    // Pre-fetch UI icons so they're cached before first use
    this._cachedIcons = {};
    var iconNames = ["delete", "swap", "space-plus"];
    for (var i = 0; i < iconNames.length; i++) {
      var img = new Image();
      img.src =
        this.resourcesPath +
        "/icons/configurator-icons/" +
        iconNames[i] +
        ".svg";
      this._cachedIcons[iconNames[i]] = img;
    }

    this.loadHDR(`${this.resourcesPath}/hdr/hdr.hdr`);
    if (this.preset.floor) this.setFloor();

    this.defaultSaturation = {
      saturation: 1.0,
      contrast: 1.04,
      brightness: 1,
      red: 1,
      green: 1,
      blue: 1,
    };

    this.signalModelConfigurationChange =
      options?.signalModelConfigurationChange || (() => { });
    this.setModelLoading = options?.setModelLoading || (() => { });
    this.setSwapInitiated = options?.setSwapInitiated || (() => { });
    this.setSwapCompleted = options?.setSwapCompleted || (() => { });

    this.setSaturationShaderValues();
  }

  setContainer(containerId) {
    this.container = document.getElementById(containerId);

    if (!this.container) {
      console.error(`Container with id: ${containerId} is not found`);
    }
  }

  createScene() {
    this.scene = new Scene();
    this.scene.background = new Color(
      this.sceneOptions?.scene?.background || 0xeeeff2,
    );
  }

  createRenderer() {
    const precision = this.preset.precision;

    this.renderer = new WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
      precision,
    });

    this.width = this.container.clientWidth || 800;
    this.height = this.container.clientHeight || 800;
    this.renderer.setSize(this.width, this.height);

    this.container.appendChild(this.renderer.domElement);

    this.renderer.outputColorSpace = SRGBColorSpace;

    const PIXEL_RATIO = this.preset.pixelRatio();
    this.renderer.setPixelRatio(PIXEL_RATIO);

    this.renderer.shadowMap.enabled = this.preset.shadowMapEnabled;
    if (!this.preset.shadowMapEnabled)
      this.renderer.shadowMap.autoUpdate = false;
    else this.renderer.shadowMap.type = this.preset.shadowMapType;

    this.renderer.toneMapping =
      this.sceneOptions.renderer?.toneMapping || NoToneMapping;
    this.renderer.toneMappingExposure =
      this.sceneOptions.renderer?.toneMappingExposure || 1;
  }

  createCSS2DRenderer() {
    this.css2DRenderer = new CSS2DRenderer();
    this.css2DRenderer.setSize(
      this.container.clientWidth,
      this.container.clientHeight,
    );

    this.css2DRenderer.domElement.classList.add("build-your-own-control");

    this.css2DRenderer.domElement.style.position = "absolute";
    this.css2DRenderer.domElement.style.pointerEvents = "none";
    this.css2DRenderer.domElement.style.touchAction = "none";
    this.css2DRenderer.domElement.style.userSelect = "none";
    this.css2DRenderer.domElement.style.top = "0px";
    this.container.append(this.css2DRenderer.domElement);
  }

  createCamera() {
    this.camera = new PerspectiveCamera(
      this.sceneOptions.camera?.fov || 45,
      this.width / this.height,
      this.sceneOptions.camera?.near || 0.1,
      this.sceneOptions.camera?.far || 500,
    );

    this.camera.layers.enableAll();
    this.camera.layers.toggle(1);

    this.scene.add(this.camera);
  }

  createControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enablePan = true;
    this.controls.enableZoom = this.sceneOptions?.controls?.enableZoom;
    this.controls.enableKeys = false;
    this.controls.minDistance = 0;
    this.controls.maxDistance = 500;
    this.controls.minPolarAngle = 0;
    this.controls.maxPolarAngle = Math.PI;
    this.controls.rotateSpeed = 0.5;

    this._prevCameraPosition = new Vector3();
    this._prevControlsTarget = new Vector3();
  }

  requestRender(frames) {
    if (frames) {
      this._renderFrames = Math.max(this._renderFrames, frames);
    }
    this.needsRender = true;
  }

  createLights(lightsArray = this.sceneOptions.lights) {
    if (!this.sceneOptions.lights) return;

    lightsArray.forEach((light) => {
      switch (light.type) {
        case "AmbientLight":
          let ambientLight = new AmbientLight(
            light.color || new Color(22, 22, 22),
            light.intensity || 1,
          );

          ambientLight.name = light.name || "ambientLight";
          ambientLight.visible =
            light.visible !== undefined ? light.visible : true;

          this.lights.add(ambientLight);

          break;
        case "DirectionalLight":
          let directionalLight = new DirectionalLight(
            light.color || "white",
            light.intensity || 1,
          );

          directionalLight.name = light.name || "directionalLight";

          directionalLight.visible =
            light.visible !== undefined ? light.visible : true;
          directionalLight.castShadow = light.shadow || false;

          if (directionalLight.castShadow) {
            directionalLight.shadow.bias = light.shadow?.bias || 0;
            directionalLight.shadow.normalBias = light.shadow?.normalBias || 0;
            directionalLight.shadow.radius = light.shadow?.radius || 1;

            directionalLight.shadow.mapSize.width =
              light.shadow?.mapSize?.width || this.preset.shadowMapSize;
            directionalLight.shadow.mapSize.height =
              light.shadow?.mapSize?.height || this.preset.shadowMapSize;
          }

          switch (light.parent) {
            case "camera":
              this.camera.add(directionalLight);
              break;
            default:
              this.lights.add(directionalLight);
              break;
          }

          directionalLight.position.copy(
            light.position || new Vector3(5, 10, 7.5),
          );
          break;
        case "SpotLight":
          let spotLight = new SpotLight(
            light.color || "white",
            light.intensity || 1,
            light.distance || 0,
            light.angle || 0.314,
            light.penumbra || 0,
            light.decay || 1,
          );

          spotLight.name = light.name || "spotLight";

          spotLight.castShadow = light.shadow || false;
          spotLight.visible =
            light.visible !== undefined ? light.visible : true;

          if (spotLight.castShadow) {
            spotLight.shadow.bias = light.shadow?.bias || 0;
            spotLight.shadow.normalBias = light.shadow?.normalBias || 0;
            spotLight.shadow.radius = light.shadow?.radius || 1;

            spotLight.shadow.mapSize.width =
              light.shadow?.mapSize?.width || this.preset.shadowMapSize; //default
            spotLight.shadow.mapSize.height =
              light.shadow?.mapSize?.height || this.preset.shadowMapSize; //default
          }

          switch (light.parent) {
            case "camera":
              if (this.preset.spotLightsOn) this.camera.add(spotLight);
              break;
            default:
              if (this.preset.spotLightsOn) this.lights.add(spotLight);
              break;
          }

          spotLight.position.copy(light.position || new Vector3(5, 10, 7.5));

          break;

        default:
          break;
      }
    });

    this.scene.add(this.lights);
  }

  setModelURL(element, modelDatas) {
    let modelData = this.data.frames.find(
      (frame) =>
        frame.collection === this.collection && frame.id === element.id,
    );

    const variantId = modelData.variants?.[this.selectedMaterialType] || modelData.id;
    let modelURL = `${this.resourcesPath}/models/${"frame-"}${variantId}/${"frame-"}${variantId}.gltf`;

    let modelObject = Object.assign({}, modelData);
    modelObject.url = modelURL;

    modelDatas.push(modelObject);
  }

  setAnimations(object, scene) {
    object.animations.forEach((animation) => {
      let anim = this.mixer.clipAction(animation, scene);
      anim.clampWhenFinished = true;
      anim.setLoop(LoopOnce);
      anim.timeScale = -1;

      this.animations.push(anim);
    });

    if (this.animations.length > 0) {
      window.dispatchEvent(new Event("animationsAvailable"));
    } else {
      window.dispatchEvent(new Event("animationsNotAvailable"));
    }
  }

  // NAILS FUNCTIONS //


  clearButtons() {
    this.buttons.children = [];
    if (this.css2DRenderer) {
      this.css2DRenderer.domElement.innerHTML = "";
    }
  }

  //DRAG AND DROP

  async onDragStart(id, cameraUpdate = true) {
    if (this.draggedObject) {
      setTimeout(() => {
        this.startSpaces(id);
      }, this.tweenDurationDND);

      this.scene.remove(this.draggedObject);
      this.endSpaces();

      delete this.draggedObject;
    } else {
      this.startSpaces(id);
    }

    this.isDragging = true;
    this._shadowDisabledForDrag = true;
    this.setShadowVisibility(false);

    // Listen on window during drag so mouse outside canvas still moves the object
    window.addEventListener("mousemove", this.onMouseMoveBound, false);

    this.clearSelected();
    //TODO: Fix conditions for frame addition to url
    const dragFrame = this.data.frames.find(
      (frame) => frame.collection === this.collection && frame.id === id,
    );
    const dragVariantId = dragFrame?.variants?.[this.selectedMaterialType] || id;
    let modelURL = `${this.resourcesPath}/models/low-poly/${"frame-"}${dragVariantId}/${"frame-"}${dragVariantId}.gltf`;

    let exists = await this.tryFetchModel(modelURL);

    if (!exists) {
      modelURL = modelURL.replace("low-poly/", "");
    }

    this.gltfLoader.load(
      modelURL,
      async (result) => {
        this.controls.enabled = false;
        this.container.style.cursor = "grab";

        this.draggedObject = result.scene;
        this.draggedObject.userData.id = id;
        this.draggedObject.children[0].userData.temp = true;

        let draggedModelData = this.data.frames.find(
          (frame) => frame.collection === this.collection && frame.id === id,
        );



        this.updateModel(this.draggedObject);
        this.updateTexture(this.draggedObject, true);

        this.scene.add(this.draggedObject);
      },
      null,
      (error) => {
        console.error(`Model with url: ${modelURL} not found`);
        // Enable controls on error
        this.container.style.cursor = "default";
        this.controls.enabled = true;
      },
    );

    if (cameraUpdate) {
      if (this.modelConfiguration.elements.length === 0) {
        this.updateCameraPosition("top", true);
      } else {
        this.updateCameraPosition("top");
      }
    }

    this.animations?.forEach((animation) => {
      if (animation.timeScale === 1) {
        animation.timeScale *= -1;
        animation.paused = false;
        animation.play();
      }
    });

    if (this.dimensionsVisible)
      clearDimensions(this.dimensions, this.css2DRenderer);
  }

  onDrag() {
    if (!this.isDragging) return;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    this.raycaster.ray.intersectPlane(
      this.raycasterPlane,
      this.raycasterVector,
    );

    this.clearButtons();

    this.onDragSnapObjects(); //FIXME: Change this name to something smarter
  }

  onDragSnapObjects() {
    const SNAP_RADIUS = 0.5;

    let mousePosition = new Vector3(
      this.raycasterVector.x,
      0.5,
      this.raycasterVector.z,
    );

    if (this.model.children.length >= 1) {
      let snapped = false;

      const width = new Box3()
        .setFromObject(this.draggedObject)
        .getSize(new Vector3()).x;

      this.spaces.children.forEach((child) => {
        if (
          child.userData.canBeSnapped &&
          mousePosition.distanceTo(child.position) < SNAP_RADIUS
        ) {
          if (this.draggedObject.rotation.y === 0)
            this.draggedObject.userData.width = width;

          this.draggedObject.rotation.copy(child.rotation);
          this.draggedObject.position.copy(child.position);
          this.draggedObject.position.y = 1;
          this.draggedObject.userData.snapped = true;

          this.draggedObject.userData.index = child.userData.index;
          snapped = true;

          let spaceIcon = child.children.find((x) => x.isCSS2DObject);
          spaceIcon.visible = false;

          this.setSpaceOnSnap(
            this.model.children[child?.userData.index - 1],
            this.model.children[child?.userData.index],
            this.draggedObject,
          );

          // this.draggedObjectIndex = this.draggedObject.userData.index;
        }

        if (!child.userData.canBeSnapped) {
          let spaceIcon = child.children.find((x) => x.isCSS2DObject);

          if (!spaceIcon) return;
          if (mousePosition.distanceTo(child.position) < SNAP_RADIUS)
            spaceIcon.visible = false;
          else spaceIcon.visible = true;
        }
      });

      if (!snapped && this.draggedObject) {
        delete this.draggedObject.userData.snapped;
        delete this.draggedObject.userData.side;
        this.draggedObject.position.copy(mousePosition);

        if (this.draggedObjectIndex !== -1) {
          let calledOnce1 = (() => {
            return () => {
              if (!this.executed) {
                this.executed = true;
                this.endSpacesAfterSnap();
              }
            };
          })();
          calledOnce1();

          this.executed = false;
          this.draggedObjectIndex = -1;
        }
      }
    } else {
      if (this.draggedObject) this.draggedObject.userData.snapped = true;
    }
  }

  async onDragEnd() {
    if (!this.draggedObject) return;

    this.isDragging = false;
    this._shadowDisabledForDrag = false;
    this.needsShadowUpdate = true;
    this.requestRender();

    // Remove window listener, back to container only
    window.removeEventListener("mousemove", this.onMouseMoveBound, false);

    if (this.dimensionsVisible)
      showDimensions(
        this.model,
        this.dimensions,
        this.leftDimensions,
        this.rightDimensions,
        this.camera,
      );

    if (this.controls.enabled) return;

    this.endSpaces();

    this.controls.enabled = true;
    this.container.style.cursor = "auto";

    this.scene.remove(this.draggedObject);

    if (this.draggedObject.userData.snapped) {
      let newArray = [
        ...this.modelConfiguration.elements.slice(
          0,
          this.draggedObject.userData.index,
        ),
        { id: this.draggedObject.userData.id },
        ...this.modelConfiguration.elements.slice(
          this.draggedObject.userData.index,
        ),
      ];
      this.modelConfiguration.elements = newArray;

      await this.loadConfiguration();
    }

    delete this.draggedObject;

    this.draggedObjectIndex = -1;

    if (this.playerSelectedItems) this.playerSelectedItems.leg = null;

    let hasTrash = this.scene.children.some((child) => child?.userData?.id);
    if (hasTrash) {
      this.disposeTrashModels();
    }

    this.updateCameraPosition();
    this.clearButtons();
  }

  disposeTrashModels() {
    if (this.scene && this.scene.children.length !== 0) {
      for (let i = this.scene.children.length - 1; i >= 0; i--) {
        const child = this.scene.children[i];
        if (child?.userData?.id) {
          this.scene.remove(child);
        }
      }
    }
  }

  startSpaces(id) {
    this.spacesID = id;

    const SPACE_BETWEEN = 0.3;

    const totalTweens = this.model.children.length;
    let completedTweens = 0;

    if (this.model.children.length === 0) return;

    let offsetX = 1;
    let offsetZ = 0;

    this.model.children.forEach((child, index) => {
      let position = child.position.clone();

      child.userData.oldPosition = child.position.clone();

      if (index > 0) {
        let previousObject = this.model.children[index - 1];
        let componentR = previousObject.getObjectByName("component_r");

        let componentQuaternion = new Quaternion();
        componentR?.getWorldQuaternion(componentQuaternion);

        if (previousObject.userData.model.corner) {
          let temp = offsetZ;
          offsetZ = offsetX - 1;

          offsetX = 1 - temp;
        }

        if (
          child.userData.model.pairing.left.includes(id) &&
          previousObject.userData.model.pairing.right.includes(id)
        ) {
          let offset = new Vector3(
            SPACE_BETWEEN * offsetX,
            0,
            -SPACE_BETWEEN * offsetZ,
          ).applyQuaternion(componentQuaternion);

          position.add(offset);

          offsetX++;
        }
      }

      child.userData.newPosition = position;

      new TWEEN.Tween(child.position)
        .to(position, this.tweenDurationDND)
        .start()
        .onComplete(() => {
          completedTweens++;

          if (totalTweens === completedTweens && this.isDragging) {
            this.spaces.children = [];
            this.setSpaces(id);
          }
        });
    });
  }

  endSpaces() {
    this.spaces.children = [];

    this.model.children.forEach((child) => {
      let position = child.userData.oldPosition;

      new TWEEN.Tween(child.position)
        .to(position, this.tweenDurationDND)
        .start();
    });
  }

  setSpaces(id) {
    let lastComponentR = new Vector3();
    let lastComponentUserData;

    const SPACE_BETWEEN = 0.3;

    this.spaces.children = [];

    this.model.children.forEach((child, index) => {
      let componentL = child.getObjectByName("component_l");
      let componentR = child.getObjectByName("component_r");

      let spacePosition;
      let spaceRotation;

      if (componentL) {
        let position = new Vector3();
        componentL?.getWorldPosition(position);

        let rotation = new Quaternion();
        componentL?.getWorldQuaternion(rotation);

        spaceRotation = new Euler().setFromQuaternion(rotation, "YXZ");

        spacePosition = position;

        if (index > 0) {
          let offset = new Vector3(SPACE_BETWEEN / 2, 0, 0);
          offset.applyQuaternion(rotation);

          spacePosition.copy(lastComponentR).add(offset);
        } else {
          child
            .getObjectByName("component_R")
            ?.getWorldPosition(lastComponentR);
        }

        let canBeSnapped = false;

        if (lastComponentUserData) {
          canBeSnapped =
            lastComponentUserData.model.pairing.right.includes(id) &&
            child.userData.model.pairing.left.includes(id);
        } else {
          canBeSnapped = child.userData.model.pairing.left.includes(id);

          if (index === 1) {
            let canBeAdded =
              this.model.children[
                index - 1
              ].userData.model.pairing.right.includes(id);
            if (!canBeAdded) {
              canBeSnapped = false;
            }
          }
        }

        let spaceObject = new Group();
        spaceObject.position.copy(spacePosition);
        spaceObject.rotation.copy(spaceRotation);
        spaceObject.userData.index = index;
        spaceObject.userData.canBeSnapped = canBeSnapped;
        spaceObject.userData.newPosition = spacePosition;

        if (canBeSnapped) {
          let spaceDiv = document.createElement("div");
          spaceDiv.append(this._cachedIcons["space-plus"].cloneNode());

          let icon = new CSS2DObject(spaceDiv);
          icon.name = "space-label";

          if (index === 0) icon.position.x -= SPACE_BETWEEN / 2;

          spaceObject.add(icon);

          this.spaces.add(spaceObject);
        }

        lastComponentUserData = child.userData;
      }

      if (componentR) {
        if (index === this.model.children.length - 1) {
          let position = new Vector3();
          componentR?.getWorldPosition(position);

          let rotation = new Quaternion();
          componentR?.getWorldQuaternion(rotation);

          spaceRotation = new Euler().setFromQuaternion(rotation, "YXZ");

          spacePosition = position;

          let canBeSnapped = child.userData.model.pairing.right.includes(id);

          let spaceObject = new Group();
          spaceObject.position.copy(spacePosition);
          spaceObject.rotation.copy(spaceRotation);
          spaceObject.userData.index = index + 1;
          spaceObject.userData.canBeSnapped = canBeSnapped;

          if (canBeSnapped) {
            let spaceDiv = document.createElement("div");
            spaceDiv.append(this._cachedIcons["space-plus"].cloneNode());

            let icon = new CSS2DObject(spaceDiv);
            icon.name = "space-label";

            icon.position.x += SPACE_BETWEEN / 2;

            spaceObject.add(icon);
          }

          this.spaces.add(spaceObject);
        } else {
          child
            .getObjectByName("component_R")
            ?.getWorldPosition(lastComponentR);
        }
      }
    });

    if (
      this.model.children[this.model.children.length - 1]?.userData.model
        .pairing?.left &&
      this.spaces.children[this.spaces.children.length - 1]
    )
      this.spaces.children[
        this.spaces.children.length - 1
      ].userData.newPosition =
        this.spaces.children[this.spaces.children.length - 1].position.clone();
  }

  setSpaceOnSnap(previous, next, draggedObject) {
    let width = draggedObject.userData.width;

    let objectToChangeLeft = new Vector3();
    let objectToChangeRight = new Vector3();

    let draggedAngle = draggedObject.rotation.y;

    if (this.draggedObjectIndex !== draggedObject.userData.index) {
      let previousPosition, nextPosition;

      let offset = new Vector3(
        (width / 2) * Math.cos(draggedAngle),
        0,
        -(width / 2) * Math.sin(draggedAngle),
      );

      if (previous) {
        previousPosition = previous.userData.newPosition.clone();
        previousPosition.sub(offset);
        objectToChangeLeft.sub(offset);
        new TWEEN.Tween(previous.position)
          .to(previousPosition, this.tweenDurationDND)
          .start();
      }

      if (next) {
        nextPosition = next.userData.newPosition.clone();
        nextPosition.add(offset);
        objectToChangeRight.add(offset);
        new TWEEN.Tween(next.position)
          .to(nextPosition, this.tweenDurationDND)
          .start();
      }

      if (nextPosition !== undefined) {
        new TWEEN.Tween(next.position)
          .to(nextPosition, this.tweenDurationDND)
          .start();
      }

      this.draggedObjectIndex = draggedObject.userData.index;

      this.markersArray(objectToChangeLeft, objectToChangeRight);
      this.modelsArray(objectToChangeLeft, objectToChangeRight);
    }
  }

  endSpacesAfterSnap() {
    this.model.children.forEach((child) => {
      new TWEEN.Tween(child.position)
        .to(child.userData.newPosition, this.tweenDurationDND)
        .start();
    });

    this.spaces.children.forEach((space) => {
      let spaceIcon = space.children.find((x) => x.isCSS2DObject);

      if (!spaceIcon) return;
      spaceIcon.visible = true;

      if (space.userData.newPosition) {
        new TWEEN.Tween(space.position)
          .to(space.userData?.newPosition, this.tweenDurationDND)
          .start();
      }
    });
  }

  markersArray(objectToChangeLeft, objectToChangeRight) {
    const spacesCount = this.spaces.children.length;
    const index = this.draggedObjectIndex;

    const firstHasLeftPairing =
      this.model.children[0].userData.model.pairing.left;

    const leftStart = 0;
    const leftEnd = firstHasLeftPairing ? index : index - 1;
    const rightStart = firstHasLeftPairing ? index + 1 : index;
    const rightEnd = spacesCount;

    this.leftArr =
      index > 0 ? this.spaces.children.slice(leftStart, leftEnd) : [];

    this.rightArr =
      index < spacesCount
        ? this.spaces.children.slice(rightStart, rightEnd)
        : [];

    // far right
    if (rightStart > spacesCount) this.leftArr = [];

    this.align(objectToChangeLeft, objectToChangeRight);
  }

  align(objectToChangeLeft, objectToChangeRight) {
    if (this.leftArr.length > 0) {
      this.leftArr.forEach((model) => {
        let position = new Vector3();
        if (model.userData.newPosition) {
          position = model.userData.newPosition.clone().add(objectToChangeLeft);
          new TWEEN.Tween(model.position)
            .to(position, this.tweenDurationDND)
            .start();
        }
      });
    }

    if (this.rightArr.length > 0) {
      this.rightArr.forEach((model) => {
        let position = new Vector3();
        if (model.userData.newPosition) {
          position = model.userData.newPosition
            .clone()
            .add(objectToChangeRight);
          new TWEEN.Tween(model.position)
            .to(position, this.tweenDurationDND)
            .start();
        } else {
          // pomeranje krajnjeg desnog space-a
          position = model.position.clone().add(objectToChangeRight);
          new TWEEN.Tween(model.position)
            .to(position, this.tweenDurationDND)
            .start();
        }
      });
    }
  }

  modelsArray(objectToChangeLeft, objectToChangeRight) {
    this.leftArr =
      this.draggedObjectIndex > 1
        ? this.model.children.slice(0, this.draggedObjectIndex - 1)
        : [];
    this.rightArr =
      this.draggedObjectIndex < this.model.children.length - 1
        ? this.model.children.slice(this.draggedObjectIndex + 1)
        : [];

    this.align(objectToChangeLeft, objectToChangeRight);
  }

  // DRAG AND DROP BUTTONS

  createButtonLabelUI() {
    if (this._buttonLabelUI) return;

    var wrapper = document.createElement("div");

    var buttonsDiv = document.createElement("div");
    buttonsDiv.className = "drag-and-drop-buttons";

    // Delete
    var deleteDiv = document.createElement("div");
    deleteDiv.className = "drag-and-drop-button";
    deleteDiv.style.zIndex = 9999999;
    deleteDiv.style.pointerEvents = "auto";

    var deleteImg = document.createElement("img");
    deleteImg.id = "delete";
    deleteImg.src = this.resourcesPath + "/icons/configurator-icons/delete.svg";

    var deleteText = document.createElement("p");
    deleteText.innerHTML = "Delete";

    deleteDiv.append(deleteImg, deleteText);
    deleteDiv.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      this.deleteSelectedElement();
      this.scene.remove(this.buttonLabel);
    });

    // Swap
    var swapDiv = document.createElement("div");
    swapDiv.className = "drag-and-drop-button";
    swapDiv.style.zIndex = 9999999;
    swapDiv.style.pointerEvents = "auto";

    var swapImg = document.createElement("img");
    swapImg.id = "swap";
    swapImg.src = this.resourcesPath + "/icons/configurator-icons/swap.svg";

    var swapText = document.createElement("p");
    swapText.innerHTML = "Swap";

    swapDiv.append(swapImg, swapText);
    swapDiv.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      if (this._buttonLabelSelectedObject) {
        this.setSwapState(this._buttonLabelSelectedObject);
      }
      this.scene.remove(this.buttonLabel);
    });

    buttonsDiv.append(deleteDiv, swapDiv);

    var selectedDiv = document.createElement("div");
    selectedDiv.className = "selectedElementDiv";

    var selectedText = document.createElement("p");
    selectedText.className = "selectedElement";

    selectedDiv.append(selectedText);

    wrapper.append(buttonsDiv, selectedDiv);

    this.buttonLabel = new CSS2DObject(wrapper);
    this.buttonLabel.renderOrder = 10;

    this._buttonLabelUI = {
      buttonsDiv: buttonsDiv,
      deleteDiv: deleteDiv,
      swapDiv: swapDiv,
      selectedDiv: selectedDiv,
      selectedText: selectedText,
    };
  }

  dragAndDropButtonsPosition(selectedObject) {
    this.createButtonLabelUI();
    this.scene.remove(this.buttonLabel);

    this._buttonLabelSelectedObject = selectedObject;

    // Show/hide swap button based on element count
    if (this.modelConfiguration.elements.length > 1) {
      this._buttonLabelUI.swapDiv.style.display = "";
    } else {
      this._buttonLabelUI.swapDiv.style.display = "none";
    }

    this._buttonLabelUI.selectedText.innerHTML =
      "Selected: " + selectedObject.userData.model.name;
    this._buttonLabelUI.buttonsDiv.style.display = "";
    this._buttonLabelUI.selectedDiv.style.display = "";

    this.buttonLabel.position.copy(selectedObject.position);
    this.buttonLabel.rotation.copy(selectedObject.rotation);

    this.scene.add(this.buttonLabel);
  }

  onMouseMove(event) {
    if (!this.renderer) return;
    event.preventDefault();
    let rect = this.container.getBoundingClientRect();

    this.mouse.x =
      ((event.clientX - rect.left) / this.renderer.domElement.clientWidth) * 2 -
      1;
    this.mouse.y =
      -((event.clientY - rect.top) / this.renderer.domElement.clientHeight) *
      2 +
      1;

    if (!this.controls.enabled) {
      this.onDrag();
      this.requestRender();
    }
  }

  onMouseClick() {
    if (this.editSelected) {
      this.raycaster.setFromCamera(this.mouse, this.camera);
      let intersects = this.raycaster.intersectObjects(this.model.children);

      intersects = intersects.filter((x) => !x.object.isLineSegments);

      if (intersects.length > 0) {
        let selectedObject = intersects[0].object;

        let test = false;

        if (selectedObject.userData?.model) test = true;

        while (!test) {
          selectedObject = selectedObject.parent;

          if (selectedObject.userData?.model) test = true;
        }

        this.dragAndDropButtonsPosition(selectedObject);
        this.selectedObjectId = selectedObject.uuid;

        this.setSelected(selectedObject);
      } else {
        if (!this.swap) {
          this.clearSelected();
        }
      }
      this.requestRender();
    }
  }

  clearSelected() {
    if (this.swap) {
      this.swap = null;
      this.setSwapCompleted();
    }

    const selectionColor = new Color(0x9a9a9a);

    this.model.traverse((child) => {
      if (child.material) {
        if (selectionColor.equals(child.material.color))
          child.material.color.set(0xffffff);
      }
    });
    this.selectedObject = null;

    if (document.querySelector(".drag-and-drop-buttons"))
      document.querySelector(".drag-and-drop-buttons").style.display = "none";

    if (document.querySelector(".selectedElementDiv"))
      document.querySelector(".selectedElementDiv").style.display = "none";
  }

  setSelected(object) {
    this.clearSelected();
    this.selectedObject = object;

    const white = new Color(0xffffff);

    this.selectedObject.traverse((child) => {
      if (child.material) {
        if (child.material.color.equals(white))
          child.material.color.set(0x9a9a9a);
      }
    });
  }

  async deleteSelectedElement() {
    // Find index of selected element
    let selectedModelIndex = this.model.children.indexOf(this.selectedObject);

    this.modelConfiguration.elements.splice(selectedModelIndex, 1);
    await this.loadConfiguration();

    if (document.querySelector(".drag-and-drop-buttons"))
      document.querySelector(".drag-and-drop-buttons").style.display = "none";

    if (document.querySelector(".selectedElementDiv"))
      document.querySelector(".selectedElementDiv").style.display = "none";
  }

  setSwapState(object) {
    const index = this.model.children.indexOf(object);

    let leftObject = index > 0 ? this.model.children[index - 1] : null;
    let rightObject =
      index < this.model.children.length - 1
        ? this.model.children[index + 1]
        : null;

    this.swap = {
      index: index,
      model: object.userData.model,
      leftModel: leftObject ? leftObject.userData.model : null,
      rightModel: rightObject ? rightObject.userData.model : null,
    };
    this.setSwapInitiated();
  }

  //LOADERS

  loadObject(url) {
    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        url,
        (result) => {
          this.checkForStandardMaterial(result.scene);

          resolve(result);
        },
        undefined, // optional onProgress
        (error) => {
          console.warn("Failed to load GLTF:", url, error);
          reject(error);
        },
      );
    });
  }

  async loadObjects(modelDatas) {
    const promises = modelDatas.map((modelData) => {
      return new Promise((resolve) => {
        this.gltfLoader.load(
          modelData.url,
          (result) => {
            this.checkForStandardMaterial(result.scene);
            result.scene.userData.model = modelData;

            if (result.animations?.length > 0) {
              this.setAnimations(result, result.scene);
            }
            resolve(result);
          },
          undefined,
          (error) => {
            console.error(
              `Model load error: "${modelData.url?.match(/resources\/.+/)?.[0]}" not found.`,
            );

            resolve(null);
          },
        );
      });
    });

    const results = await Promise.all(promises);

    const successfulModels = results.filter((result) => result !== null);

    const hasAnimations = successfulModels.some(
      (res) => res.animations?.length > 0,
    );
    window.dispatchEvent(
      new Event(
        hasAnimations ? "animationsAvailable" : "animationsNotAvailable",
      ),
    );

    return successfulModels;
  }

  getModel(modelData) {
    this.newObject = this.loadedModels.find(
      (x) => x.scene.userData.model.id === modelData.id,
    );
    if (this.cache) {
      let model = SkeletonUtils.clone(this.newObject.scene);

      model.traverse((element) => {
        if (element.material) {
          element.material = element.material.clone();
        }
      });

      if (this.newObject.animations) {
        this.setAnimations(this.newObject, model);
      }

      return model;
    } else {
      // Animation is not working if we clone the scene
      // let newScene = this.newObject.scene.clone();
      let newScene = SkeletonUtils.clone(this.newObject.scene);

      this.setAnimations(this.newObject, newScene);

      return newScene;
    }
  }

  loadHDR(input) {
    if (this.preset.hdrIntensity === 0) return;

    new HDRLoader().load(input, (texture) => {
      texture.mapping = EquirectangularReflectionMapping;

      this.hdrTexture = texture;
      this.scene.environment = texture;
      this.scene.environmentIntensity = this.preset.hdrIntensity;
      this.requestRender();
    });
  }

  async loadTexture(url) {
    let tex = new Promise((resolve) => {
      this.textureLoader.load(
        url,
        (result) => {
          result.userData.url = url;
          if (!this.loadedTextures) this.loadedTextures = [];
          if (!url.includes("icon")) {
            this.loadedTextures.push(result);
          }

          resolve(result);
        },
        undefined,
        () => {
          console.error(`Failed to load texture: ${url}. Check resources.`);
          resolve(null);
        },
      );
    });

    return tex;
  }

  async loadInitalMaps() {
    // await this.loadFabric(
    //   {
    //     name: "hazelnut",
    //     map: `${this.resourcesPath}/textures/woods/hazelnut/hazelnut.jpg`,
    //     type: "wood",
    //     repeatWidth: 10,
    //     repeatHeight: 10,

    //     normalMap: `${
    //       this.resourcesPath
    //     }/textures/woods/hazelnut/hazelnut_normal.jpg`,
    //   },
    //   "wood",
    // );

    this.materials.push({
      name: "unfinished",
      color: new Color(0x3d3630),
      roughness: 1,
      metalness: 0,
    });

    this.materials.push({
      name: "power_button",
      color: new Color(0x000000),
      roughness: 0.75,
      metalness: 0,
    });
  }

  async loadModel(model) {
    if (this.isRunning) return;

    delete this.modelLoaded;

    this.animations = [];
    this.mixer = new AnimationMixer(this.model);

    if (typeof model === "string") {
      model = this.data.frames.find((item) => item.sku === model);
    }

    this.isRunning = true;

    if (this.loadingScreen) {
      this.loadingScreen.style.display = "block";
      this.setModelLoading(true);
    }

    if (!model) {
      model = this.currentBrandStaticFramesData[0];
    }

    this.selectedFrame = model;

    model.url = `${this.resourcesPath}/models/${model.sku}/${model.sku}.gltf`;

    this.model.children = [];

    this.gltfLoader.load(
      model.url,
      async (result) => {
        try {
          // await this.loadModelMaps(model, result.scene);

          // Monterey
          if (model?.collectionName === "Monterey") {
            this.sswLoadTexturePerSku(model, "Wood Frame");
          }

          if (model.legSwitch) {
            await this.loadConnectStaticFrameLeg(result.scene, model);
            window.dispatchEvent(new Event("legSwitchAvailable"));
          } else {
            window.dispatchEvent(new Event("legSwitchNotAvailable"));
          }

          this.model.add(result.scene);
          this.setSize(result.scene);

          this.checkForStandardMaterial(result.scene);

          result.scene.userData.model = model;

          this.updateCameraPosition();
          this.ensureRenderTarget();
          contactShadow(
            this.model,
            this.scene,
            this.plane,
            this.shadowGroup,
            this.renderTarget,
            this.shadowCamera,
          );
          this.needsShadowUpdate = true;

          this.currentDimensions = calculateDimensions(this.model);

          // TODO: "result.animations?.length > 0" is for development, should be removed in the future
          if (model.animatedModel || result.animations?.length > 0) {
            console.log('nasao anim')
            result.animations.forEach((animation) => {
              let anim = this.mixer.clipAction(animation, result.scene);
              anim.clampWhenFinished = true;
              anim.setLoop(LoopOnce);
              anim.timeScale = -1;

              this.animations.push(anim);
            });

            window.dispatchEvent(new Event("animationsAvailable"));
          } else {
            window.dispatchEvent(new Event("animationsNotAvailable"));
          }

          if (model.weltOptions) {
            window.dispatchEvent(new Event("weltOptions"));

            //TODO: REVIEW THIS
            Object.keys(model.weltOptions).forEach((option) => {
              this.setWeltOption(
                this.WELT_OPTIONS[model.weltOptions.cushion.default],
                this.WELT_AREAS[option],
              );
            });
          } else {
            window.dispatchEvent(new Event("NoWeltOptions"));
          }

          this.updateTexture();

          this.modelLoaded = true;

          if (this.loadingScreen && this.texLoaded && this.modelLoaded) {
            this.loadingScreen.style.display = "none";
            this.setModelLoading(false);
          }
        } catch (err) {
          console.warn("Error while processing loaded GLTF:", err);
        }
      },
      undefined,
      () => {
        console.error(
          `Model load error: "${model.url?.match(/resources\/.+/)?.[0]}" not found.`,
        );
        return;
      },
    );

    setTimeout(() => {
      this.recompileShader();
    }, 1000);

    this.isRunning = false;
  }

  // Static frames legs connect

  async loadConnectStaticFrameLeg(model, data) {
    if (!this.selectedBaseType) {
      this.selectedBaseType = data.legSwitch[0];
    }

    let legPath = `${this.resourcesPath
      }/models/legs/${this.selectedBaseType.name
        .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
        .toLowerCase()}s/leg-${this.selectedBaseType.sku.replace("#", "")}.gltf`;

    let leg = (await this.loadObject(legPath)).scene;

    //socket packing
    let sockets = model.getObjectByName("sockets").children;
    // let path = `${this.resourcesPath}/models/${this.brand.modelPath}/${this.collection}/`;

    for (const socket of sockets) {
      if (socket.name.includes("leg")) {
        let legClone = leg.clone();
        legClone.userData.attachedToSocket = socket.name;

        let legPosition = legClone.getObjectByName("leg")?.position;

        this.setRotationFromObject(legClone, socket);

        legClone.position.copy(socket.position);

        if (legPosition) legClone.position.add(legPosition.negate());

        legClone.updateMatrixWorld();
        legClone.name = "Leg_Clone";
        model.add(legClone);
      }
    }
  }

  async init() {
    this.setCollection(this.collection);



    // this.brand.id !== "BY"
    //   ? (this.selectedMaterialType = "Fabric")
    //   : (this.selectedMaterialType = "Leather");

    this.setDefaultCollectionOptions(this.collection, this.brand?.id);

    await this.loadInitalMaps();

    this.setCurrentStaticModelsData();

    if (this.selectedFrame) {
      if (this.staticFrame) {
        await this.loadModel(this.selectedFrame);
      } else {
        if (this.selectedPopularConfiguration) {
          this.modelConfiguration = this.selectedPopularConfiguration;
        } else {
          this.modelConfiguration = {
            elements: [this.selectedFrame],
          };
        }
        this.loadConfiguration();
      }
    }


    if (this.selectedArmType?.nails) {
      window.dispatchEvent(new Event("nailsAvailable"));
    } else {
      window.dispatchEvent(new Event("nailsNotAvailable"));
    }

    if (this.options.gui) {
      this.createGuiContainer();
      this.createStats();
    }

    if (this.selectedFabric) {
      if (Array.isArray(this.selectedFabric)) {
        for (const selectedFabric of this.selectedFabric) {
          await this.loadFabric(selectedFabric.texture, selectedFabric.name);
        }
      } else {
        // TODO: Backwards compatibility, should be removed in the future
        await this.loadFabric(this.selectedFabric, "main");
      }
    }

    if (this.selectedLeather) {
      if (Array.isArray(this.selectedLeather)) {
        for (const selectedLeather of this.selectedLeather) {
          await this.loadFabric(selectedLeather.texture, selectedLeather.name);
        }
      } else {
        // TODO: Backwards compatibility, should be removed in the future
        await this.loadFabric(this.selectedLeather, "main");
      }
    }

    if (this.selectedFinish) {
      await this.loadFinish(this.selectedFinish);
    }
  }



  async loadConfiguration() {
    if (!this.modelConfiguration || this.isRunning) return;

    delete this.modelLoaded;

    if (this.loadingScreen) {
      this.loadingScreen.style.display = "block";
      this.setModelLoading(true);
    }

    this.isRunning = true;

    this.clearButtons();

    this.clearModel();
    this.animations = [];
    this.mixer = new AnimationMixer(this.model);

    let modelDatas = [];

    for (const element of this.modelConfiguration.elements) {
      this.setModelURL(element, modelDatas);
    }

    let models = await this.loadObjects(modelDatas);

    this.loadedModels = this.loadedModels.concat(models);

    for (const element of this.modelConfiguration.elements) {
      let modelData = this.data.frames.find(
        (frame) =>
          frame.collection === this.collection && frame.id === element.id,
      );

      const index = this.modelConfiguration.elements.indexOf(element);
      let newModel = models[index].scene;




      newModel.userData.model = modelData;

      if (element.temp) {
        newModel.userData.temp = element.temp;
      }

      this.setSize(newModel);

      if (this.model.children.length > 0) {
        let previousObject =
          this.model.children[this.model.children.length - 1];

        let componentR = previousObject.getObjectByName("component_r");
        componentR.getWorldQuaternion(newModel.quaternion);

        let componentL = newModel.getObjectByName("component_l");

        newModel.rotateX(-componentL.rotation.x);
        newModel.rotateY(-componentL.rotation.y);
        newModel.rotateZ(-componentL.rotation.z);
        newModel.updateMatrixWorld();

        let componentRWP = new Vector3();
        componentR.getWorldPosition(componentRWP);
        let componentLWP = new Vector3();
        componentL.getWorldPosition(componentLWP);

        newModel.position.add(componentRWP);
        newModel.position.add(componentLWP.negate());
        newModel.updateMatrixWorld();
      }

      newModel.userData.model = modelData;

      let sockets = newModel.getObjectByName("sockets");

      if (sockets) {
        await this.loadAndConnectLegs(newModel);
      }



      this.model.add(newModel);

      if (this.collectionOptions["baseTypes"]) {
        window.dispatchEvent(new Event("legSwitchAvailable"));
      } else {
        window.dispatchEvent(new Event("legSwitchNotAvailable"));
      }

      if (this.collectionOptions["seatCushionTypes"]) {
        this.checkSeatTypes(this.modelConfiguration);
      } else {
        window.dispatchEvent(new Event("seatCushionSwitchNotAvailable"));
      }
    }

    this.updateModel();

    this.updateTexture();

    if (this.preset.contactShadow) {
      this.ensureRenderTarget();
      contactShadow(
        this.model,
        this.scene,
        this.plane,
        this.shadowGroup,
        this.renderTarget,
        this.shadowCamera,
      );
      this.needsShadowUpdate = true;
    }


    this.scene.add(this.buttons);

    this.updateCameraPosition();

    this.isRunning = false;

    clearDimensions(this.dimensions, this.css2DRenderer);
    if (this.dimensionsVisible)
      showDimensions(
        this.model,
        this.dimensions,
        this.leftDimensions,
        this.rightDimensions,
        this.camera,
      );
    this.currentDimensions = calculateDimensions(this.model);

    this.setAvailableApplicationAreas();

    // Signal FE after dimensions are calculated so getDimensions() returns current values
    this.signalModelConfigurationChange();

    this.modelLoaded = true;

    if (this.loadingScreen && this.texLoaded && this.modelLoaded) {
      this.loadingScreen.style.display = "none";
      this.setModelLoading(false);
    }
  }

  async loadMapsPerModelSSW(collectionName) {
    let customMapPath = `${this.resourcesPath}/models/${this.brand.modelPath
      }/static-frames/custom-maps`;
    switch (collectionName) {
      case "Havana":
        await this.loadFabric(
          {
            map: `${customMapPath}/rattan/${collectionName}/${collectionName}-Rattan.jpg`,
            normalMap: `${customMapPath}/rattan/${collectionName}/${collectionName}-Rattan_Normal.jpg`,
            aoMap: `${customMapPath}/rattan/${collectionName}/${collectionName}-Rattan_AO.jpg`,
            repeatWidth: 5,
            repeatHeight: 5,
          },
          "rattan",
        );
        break;
      case "Milano":
        await this.loadFabric(
          {
            // map: `${this.resourcesPath}/models/${this.selectedBrand}/custom-maps/metal_frame/${this.selectedBrandCollection}/${this.selectedBrandCollection}-Metal_frame.jpg`,
            normalMap: `${customMapPath}/metal-frame/${collectionName}/${collectionName}-Metal-Frame_Normal.jpg`,
            // aoMap: `${this.resourcesPath}/models/${this.selectedBrand}/custom-maps/metal_frame/${this.selectedBrandCollection}/${this.selectedBrandCollection}-Metal-Frame_AO.jpg`,
            repeatWidth: 5,
            repeatHeight: 5,
          },
          "metal_frame",
        );

        await this.loadFabric(
          {
            map: `${customMapPath}/rope/${collectionName}/${collectionName}-Rope.jpg`,
            normalMap: `${customMapPath}/rope/${collectionName}/${collectionName}-Rope_Normal.jpg`,
            aoMap: `${customMapPath}/rope/${collectionName}/${collectionName}-Rope_AO.jpg`,
            repeatWidth: 20,
            repeatHeight: 20,
          },
          "rope",
        );
        break;

      case "Pietra":
        await this.loadFabric(
          {
            map: `${customMapPath}/rope/${collectionName}/${collectionName}-Rope.jpg`,
            normalMap: `${customMapPath}/rope/${collectionName}/${collectionName}-Rope_Normal.jpg`,
            aoMap: `${customMapPath}/rope/${collectionName}/${collectionName}-Rope_AO.jpg`,
            repeatWidth: 4,
            repeatHeight: 4,
          },
          "rope",
        );
        break;

      case "Cambria":
        await this.loadFabric(
          {
            map: `${customMapPath}/wood-frame/${collectionName}/${collectionName}-Wood-Frame.jpg`,
            normalMap: `${customMapPath}/wood-frame/${collectionName}/${collectionName}-Wood-Frame_Normal.jpg`,
            aoMap: `${customMapPath}/wood-frame/${collectionName}/${collectionName}-Wood-Frame_AO.jpg`,
            repeatWidth: 5,
            repeatHeight: 5,
          },
          "wood_frame",
        );
        await this.loadFabric(
          {
            map: `${customMapPath}/rattan/${collectionName}/${collectionName}-Rattan.jpg`,
            normalMap: `${customMapPath}/rattan/${collectionName}/${collectionName}-Rattan_Normal.jpg`,
            aoMap: `${customMapPath}/rattan/${collectionName}/${collectionName}-Rattan_AO.jpg`,
            repeatWidth: 55,
            repeatHeight: 40,
          },
          "rattan",
        );

        break;

      case "Redondo":
        await this.loadFabric(
          {
            map: `${customMapPath}/metal-frame/${collectionName}/${collectionName}-Metal-Frame.jpg`,
            normalMap: `${customMapPath}/metal-frame/${collectionName}/${collectionName}-Metal-Frame_Normal.jpg`,
            // aoMap: `${customMapPath}/metal-frame/${collectionName}/${collectionName}-Metal-Frame_AO.jpg`,
            roughness: 0.8,
            repeatWidth: 10,
            repeatHeight: 10,
          },
          "metal_frame",
        );
        break;

      case "Malibu":
        await this.loadFabric(
          {
            // map: `${customMapPath}/metal-frame/${collectionName}/${collectionName}-Metal-Frame.jpg`,
            normalMap: `${customMapPath}/metal-frame/${collectionName}/${collectionName}-Metal-Frame_Normal.jpg`,
            roughness: 0.4,
            repeatWidth: 10,
            repeatHeight: 10,
          },
          "metal_frame",
        );

        break;

      case "Playa":
        await this.loadFabric(
          {
            map: `${customMapPath}/rattan-shell/${collectionName}/${collectionName}-Rattan-Shell.jpg`,
            normalMap: `${customMapPath}/rattan-shell/${collectionName}/${collectionName}-Rattan-Shell_Normal.jpg`,
            aoMap: `${customMapPath}/rattan-shell/${collectionName}/${collectionName}-Rattan-Shell_AO.jpg`,
            type: "rattan",
            repeatWidth: 10,
            repeatHeight: 10,
          },
          "rattan_shell",
        );
        await this.loadFabric(
          {
            map: `${customMapPath}/rattan/${collectionName}/${collectionName}-Rattan.jpg`,
            normalMap: `${customMapPath}/rattan/${collectionName}/${collectionName}-Rattan_Normal.jpg`,
            aoMap: `${customMapPath}/rattan/${collectionName}/${collectionName}-Rattan_AO.jpg`,
            repeatWidth: 10,
            repeatHeight: 10,
          },
          "rattan",
        );

        await this.loadFabric(
          {
            map: `${customMapPath}/rattan-frame/${collectionName}/${collectionName}-Rattan-Frame.jpg`,
            normalMap: `${customMapPath}/rattan-frame/${collectionName}/${collectionName}-Rattan-Frame_Normal.jpg`,
            aoMap: `${customMapPath}/rattan-frame/${collectionName}/${collectionName}-Rattan-Frame_AO.jpg`,
            repeatWidth: 1,
            repeatHeight: 1,
          },
          "rattan_frame",
        );

        break;

      case "Montecito":
        await this.loadFabric(
          {
            map: `${customMapPath}/rattan/${collectionName}/${collectionName}-Rattan.jpg`,
            normalMap: `${customMapPath}/rattan/${collectionName}/${collectionName}-Rattan_Normal.jpg`,
            aoMap: `${customMapPath}/rattan/${collectionName}/${collectionName}-Rattan_AO.jpg`,
            repeatWidth: 5,
            repeatHeight: 5,
          },
          "rattan",
        );

        break;

      case "Coronado":
        await this.loadFabric(
          {
            map: `${customMapPath}/rattan/${collectionName}/${collectionName}-Rattan.jpg`,
            normalMap: `${customMapPath}/rattan/${collectionName}/${collectionName}-Rattan_Normal.jpg`,
            aoMap: `${customMapPath}/rattan/${collectionName}/${collectionName}-Rattan_AO.jpg`,
            repeatWidth: 5,
            repeatHeight: 5,
          },
          "rattan",
        );
        break;

      case "Cabo":
        await this.loadFabric(
          {
            map: `${customMapPath}/rattan/${collectionName}/${collectionName}-Rattan.jpg`,
            normalMap: `${customMapPath}/rattan/${collectionName}/${collectionName}-Rattan_Normal.jpg`,
            aoMap: `${customMapPath}/rattan/${collectionName}/${collectionName}-Rattan_AO.jpg`,
            repeatWidth: 10,
            repeatHeight: 10,
            roughness: 0.8,
          },
          "rattan",
        );

        await this.loadFabric(
          {
            map: `${customMapPath}/rattan-frame/${collectionName}/${collectionName}-Rattan-Frame.jpg`,
            normalMap: `${customMapPath}/rattan-frame/${collectionName}/${collectionName}-Rattan-Frame_Normal.jpg`,
            aoMap: `${customMapPath}/rattan-frame/${collectionName}/${collectionName}-Rattan-Frame_AO.jpg`,
            repeatWidth: 1,
            repeatHeight: 1,
            roughness: 0.8,
          },
          "rattan_frame",
        );

        await this.loadFabric(
          {
            map: `${customMapPath}/rattan-shell/${collectionName}/${collectionName}-Rattan-Shell.jpg`,
            normalMap: `${customMapPath}/rattan-shell/${collectionName}/${collectionName}-Rattan-Shell_Normal.jpg`,
            aoMap: `${customMapPath}/rattan-shell/${collectionName}/${collectionName}-Rattan-Shell_AO.jpg`,
            repeatWidth: 10,
            repeatHeight: 10,
            roughness: 0.8,
          },
          "rattan_shell",
        );
        break;

      case "Provence":
        await this.loadFabric(
          {
            map: `${customMapPath}/metal-frame/${collectionName}/${collectionName}-Metal-Frame.jpg`,
            normalMap: `${customMapPath}/metal-frame/${collectionName}/${collectionName}-Metal-Frame_Normal.jpg`,
            roughnessMap: `${customMapPath}/metal-frame/${collectionName}/${collectionName}-Metal-Frame_Roughness.jpg`,
            repeatWidth: 1,
            repeatHeight: 1,
          },
          "metal_frame",
        );
        break;

      case "Laguna":
        await this.loadFabric(
          {
            map: `${customMapPath}/metal-frame/${collectionName}/${collectionName}-Metal-Frame.jpg`,
            normalMap: `${customMapPath}/metal-frame/${collectionName}/${collectionName}-Metal-Frame_Normal.jpg`,
            aoMap: `${customMapPath}/metal-frame/${collectionName}/${collectionName}-Metal-Frame_AO.jpg`,
            repeatWidth: 8,
            repeatHeight: 8,
          },
          "metal_frame",
        );
        break;

      case "Dana":
        await this.loadFabric(
          {
            map: `${customMapPath}/rope/${collectionName}/${collectionName}-Rope.jpg`,
            normalMap: `${customMapPath}/rope/${collectionName}/${collectionName}-Rope_Normal.jpg`,
            aoMap: `${customMapPath}/rope/${collectionName}/${collectionName}-Rope_AO.jpg`,
            repeatWidth: 10,
            repeatHeight: 10,
          },
          "rope",
        );

        await this.loadFabric(
          {
            map: `${customMapPath}/rope-frame/${collectionName}/${collectionName}-Rope-Frame.jpg`,
            normalMap: `${customMapPath}/rope-frame/${collectionName}/${collectionName}-Rope-Frame_Normal.jpg`,
            aoMap: `${customMapPath}/rope-frame/${collectionName}/${collectionName}-Rope-Frame_AO.jpg`,
            repeatWidth: 60,
            repeatHeight: 60,
          },
          "rope_frame",
        );
        break;

      case "Marbella":
        await this.loadFabric(
          {
            map: `${customMapPath}/rope/${collectionName}/${collectionName}-Rope.jpg`,
            normalMap: `${customMapPath}/rope/${collectionName}/${collectionName}-Rope_Normal.jpg`,
            aoMap: `${customMapPath}/rope/${collectionName}/${collectionName}-Rope_AO.jpg`,
            repeatWidth: 1,
            repeatHeight: 1,
          },
          "rope",
        );

        await this.loadFabric(
          {
            map: `${customMapPath}/rope-frame/${collectionName}/${collectionName}-Rope-Frame.jpg`,
            normalMap: `${customMapPath}/rope-frame/${collectionName}/${collectionName}-Rope-Frame_Normal.jpg`,
            aoMap: `${customMapPath}/rope-frame/${collectionName}/${collectionName}-Rope-Frame_AO.jpg`,
            repeatWidth: 10,
            repeatHeight: 10,
          },
          "rope_frame",
        );
        break;

      case "Miami":
        await this.loadFabric(
          {
            map: `${customMapPath}/rope/${collectionName}/${collectionName}-Rope.jpg`,
            normalMap: `${customMapPath}/rope/${collectionName}/${collectionName}-Rope_Normal.jpg`,
            aoMap: `${customMapPath}/rope/${collectionName}/${collectionName}-Rope_AO.jpg`,
            repeatWidth: 20,
            repeatHeight: 20,
          },
          "rope",
        );
        break;

      case "Sabbia":
        await this.loadFabric(
          {
            map: `${customMapPath}/rope/${collectionName}/${collectionName}-Rope.jpg`,
            normalMap: `${customMapPath}/rope/${collectionName}/${collectionName}-Rope_Normal.jpg`,
            aoMap: `${customMapPath}/rope/${collectionName}/${collectionName}-Rope_AO.jpg`,
            repeatWidth: 4,
            repeatHeight: 4,
          },
          "rope",
        );
        break;

      case "Coastal Teak":
        await this.loadFabric(
          {
            map: `${customMapPath}/wood-frame/${collectionName}/${collectionName}-Wood-Frame.jpg`,
            normalMap: `${customMapPath}/wood-frame/${collectionName}/${collectionName}-Wood-Frame_Normal.jpg`,
            aoMap: `${customMapPath}/wood-frame/${collectionName}/${collectionName}-Wood-Frame_AO.jpg`,
            repeatWidth: 10,
            repeatHeight: 10,
          },
          "wood_frame",
        );
        break;
      case "Sedona":
        await this.loadFabric(
          {
            map: `${customMapPath}/rattan/${collectionName}/${collectionName}-Rattan.jpg`,
            normalMap: `${customMapPath}/rattan/${collectionName}/${collectionName}-Rattan_Normal.jpg`,
            aoMap: `${customMapPath}/rattan/${collectionName}/${collectionName}-Rattan_AO.jpg`,
            repeatWidth: 35,
            repeatHeight: 35,
          },
          "rattan",
        );

        await this.loadFabric(
          {
            map: `${customMapPath}/rattan-frame/${collectionName}/${collectionName}-Rattan-Frame.jpg`,
            normalMap: `${customMapPath}/rattan-frame/${collectionName}/${collectionName}-Rattan-Frame_Normal.jpg`,
            aoMap: `${customMapPath}/rattan-frame/${collectionName}/${collectionName}-Rattan-Frame_AO.jpg`,
            repeatWidth: 30,
            repeatHeight: 15,
          },
          "rattan_frame",
        );

        await this.loadFabric(
          {
            map: `${customMapPath}/wood-frame/${collectionName}/${collectionName}-Wood-Frame.jpg`,
            normalMap: `${customMapPath}/wood-frame/${collectionName}/${collectionName}-Wood-Frame_Normal.jpg`,
            aoMap: `${customMapPath}/wood-frame/${collectionName}/${collectionName}-Wood-Frame_AO.jpg`,
            repeatWidth: 10,
            repeatHeight: 10,
          },
          "wood_frame",
        );
        break;

      case "Seychelles":
        await this.loadFabric(
          {
            map: `${customMapPath}/rattan/${collectionName}/${collectionName}-Rattan.jpg`,
            normalMap: `${customMapPath}/rattan/${collectionName}/${collectionName}-Rattan_Normal.jpg`,
            aoMap: `${customMapPath}/rattan/${collectionName}/${collectionName}-Rattan_AO.jpg`,
            repeatWidth: 4,
            repeatHeight: 4,
          },
          "rattan",
        );

        await this.loadFabric(
          {
            map: `${customMapPath}/rattan-frame/${collectionName}/${collectionName}-Rattan-Frame.jpg`,
            normalMap: `${customMapPath}/rattan-frame/${collectionName}/${collectionName}-Rattan-Frame_Normal.jpg`,
            aoMap: `${customMapPath}/rattan-frame/${collectionName}/${collectionName}-Rattan-Frame_AO.jpg`,
            repeatWidth: 4,
            repeatHeight: 4,
          },
          "rattan_frame",
        );

        await this.loadFabric(
          {
            map: `${customMapPath}/wood-frame/${collectionName}/${collectionName}-Wood-Frame.jpg`,
            normalMap: `${customMapPath}/wood-frame/${collectionName}/${collectionName}-Wood-Frame_Normal.jpg`,
            repeatWidth: 0.8,
            repeatHeight: 0.8,
          },
          "wood_frame",
        );
        break;
      case "Somerset":
        await this.loadFabric(
          {
            map: `${customMapPath}/rattan/${collectionName}/${collectionName}-Rattan.jpg`,
            normalMap: `${customMapPath}/rattan/${collectionName}/${collectionName}-Rattan_Normal.jpg`,
            aoMap: `${customMapPath}/rattan/${collectionName}/${collectionName}-Rattan_AO.jpg`,
            repeatWidth: 1,
            repeatHeight: 1,
          },
          "rattan",
        );

        await this.loadFabric(
          {
            map: `${customMapPath}/wood-frame/${collectionName}/${collectionName}-Wood-Frame.jpg`,
            normalMap: `${customMapPath}/wood-frame/${collectionName}/${collectionName}-Wood-Frame_Normal.jpg`,
            repeatWidth: 1,
            repeatHeight: 1,
          },
          "wood_frame",
        );
        break;
      case "Catalina":
        await this.loadFabric(
          {
            map: `${customMapPath}/rattan/${collectionName}/${collectionName}-Rattan.jpg`,
            normalMap: `${customMapPath}/rattan/${collectionName}/${collectionName}-Rattan_Normal.jpg`,
            aoMap: `${customMapPath}/rattan/${collectionName}/${collectionName}-Rattan_AO.jpg`,
            repeatWidth: 1,
            repeatHeight: 1,
          },
          "rattan",
        );

        await this.loadFabric(
          {
            map: `${customMapPath}/rattan-frame/${collectionName}/${collectionName}-Rattan-Frame.jpg`,
            repeatWidth: 1,
            repeatHeight: 1,
          },
          "rattan_frame",
        );

        await this.loadFabric(
          {
            map: `${customMapPath}/wood-frame/${collectionName}/${collectionName}-Wood-Frame.jpg`,
            normalMap: `${customMapPath}/wood-frame/${collectionName}/${collectionName}-Wood-Frame_Normal.jpg`,
            aoMap: `${customMapPath}/wood-frame/${collectionName}/${collectionName}-Wood-Frame_AO.jpg`,
            repeatWidth: 1,
            repeatHeight: 1,
          },
          "wood_frame",
        );
        break;
      default:
        break;
    }
  }

  async sswLoadTexturePerSku(model, materialName) {
    let path = `${this.resourcesPath}/models/${this.brand.modelPath
      }/static-frames/custom-maps`;

    let dashedMaterialName = materialName.replace(" ", "-");
    let lowDashedMaterialName = materialName.replace(" ", "_");

    let baseColorPath = `${path}/${dashedMaterialName.toLowerCase()}/${model.collectionName
      }/${model.collectionName}-${dashedMaterialName}_${model.sku}.jpg`;
    let normalMapPath = `${path}/${dashedMaterialName.toLowerCase()}/${model.collectionName
      }/${model.collectionName}-${dashedMaterialName}_${model.sku}_Normal.jpg`;

    let materialObj = {
      map: baseColorPath,
      normalMap: normalMapPath,
      roughness: 0.3,
      repeatWidth: 1,
      repeatHeight: 1,
      type: "wood",
    };

    await this.loadFabric(materialObj, lowDashedMaterialName.toLowerCase());
  }



  // SET DEFAULT ADDITIONAL OPTIONS FOR COLLECTION
  setDefaultCollectionOptions(collection, brandId) {
    console.log(collection, brandId)
    if (collection) {
      // Filtered additional options per collection
      let collectionOptionsData = {};

      for (const key in this.data.collectionOptions) {
        const items = this.data.collectionOptions[key];
        if (items.some((item) => item.collection === this.collection)) {
          collectionOptionsData[key] = items.filter(
            (item) => item.collection === this.collection,
          );
        }
      }

      this.collectionOptions = collectionOptionsData;

      if (this.collectionOptions) {
        for (const key of Object.keys(this.collectionOptions)) {
          switch (key) {
            case "armTypes":
              if (!this.options.armType) {
                this.selectedArmType =
                  this.collectionOptions[key].find(
                    (item) => item.sku === this.options.armType,
                  ) || this.collectionOptions[key][0];
              }

              break;
            case "baseTypes":
              if (!this.options.baseType) {
                this.selectedBaseType =
                  this.collectionOptions[key].find(
                    (item) => item.name === this.options.baseType,
                  ) || this.collectionOptions[key][0];
              }

              break;
            case "backTypes":
              if (!this.options.backType) {
                this.selectedBackType =
                  this.collectionOptions[key].find(
                    (item) => item.name === this.options.backType,
                  ) || this.collectionOptions[key][0];
              }

              break;
            case "seatCushionTypes":
              if (!this.options.seatCushionType) {
                this.selectedSeatCushionType =
                  this.collectionOptions[key].find(
                    (item) => item.name === this.options.stitchType,
                  ) || this.collectionOptions[key][0];
              }

              break;
            case "stitchTypes":
              if (!this.options.stitchType) {
                this.selectedStitchType =
                  this.collectionOptions[key].find(
                    (item) => item.name === this.options.stitchType,
                  ) || this.collectionOptions[key][0];
              }

              break;

            default:
              console.error(
                `Invalid key ${key} in collectionAdditionalOptionsData for brand ${brandId} and collection ${collection}`,
              );
              break;
          }
        }
      } else {
        console.log(
          `No additional options for brand ${brandId} and collection ${collection}`,
        );
      }
    }
  }

  async insertExternalMaps(model, modelData) {
    await new Promise((resolve) => {
      model.traverse((child) => {
        if (child.material) {
          if (this.materialWithBake(child.material.name)) {
            this.handleCollectionMatchmaterialWithExternalMaps(
              modelData,
              child,
            );
          }
        }
      });

      resolve("done");
    });
  }

  // SEPARATED FUNCTIONS FOR HANDLING MAPS IN COLLECTIONS FUNCTIONS
  handleCollectionMatchmaterialWithExternalMaps(modelData, child) {
    if (this.collection === "luxe-for-living") {
      switch (child.material.name) {
        case "arm_inside":
        case "arm_outside":
        case "arm_panel":
          child.userData.externalMaps =
            this.collectionMaps.armOutsideInsidePanel;

          break;
        case "front_top":
        case "front_bottom":
        case "front":
        case "extra_border":
          child.userData.externalMaps = this.collectionMaps.front;
          break;

        case "back_inside":
          child.userData.externalMaps = this.collectionMaps.backInside;
          break;
        case "back_outside":
          child.userData.externalMaps = this.collectionMaps.backOutside;
          break;
        case "back_cushion":
        case "headrest_top":
        case "headrest_bottom":
          child.userData.externalMaps = this.collectionMaps.defaultCushion;
          break;
        case "seat_cushion":
        case "seat_cushion_border":
        case "seat_cushion_unfinished":
          child.userData.externalMaps = ["67", "68", "OT", "41", "42"].includes(
            modelData.id,
          )
            ? this.collectionMaps.customCushion
            : this.collectionMaps.defaultCushion;
          break;

        default:
          child.userData.externalMaps = this.blankExternalMaps.blanks;
          break;
      }
    } else if (this.collection === "sectional-seating-by-design") {
      switch (child.material.name) {
        case "arm_inside":
        case "arm_outside":
        case "arm_panel":
        case "front_top":
        case "front_bottom":
        case "back_outside":
        case "back_inside":
        case "front":
        case "extra_border":
          child.userData.externalMaps = this.collectionMaps.stitch;

          break;

        case "seat_cushion":
        case "seat_cushion_border":
          child.userData.externalMaps = child.userData.externalMaps = [
            "41",
            "42",
            "68",
            "OT",
          ].includes(modelData.id)
            ? this.collectionMaps.customCushion
            : "25" === modelData.id
              ? this.collectionMaps.chairCushion
              : this.collectionMaps.defaultCushion;

          break;
        case "back_cushion":
          child.userData.externalMaps =
            modelData.id === "25"
              ? this.collectionMaps.chairCushion
              : this.collectionMaps.defaultCushion;
          break;

        default:
          console.warn("No external maps found for " + child.material.name);
          break;
      }
    } else if (this.collection === "plaza-midwood") {
      switch (child.material.name) {
        case "arm_inside":
        case "arm_outside":
        case "arm_panel":
        case "front_top":
        case "front_bottom":
        case "back_outside":
        case "back_inside":
        case "front":
        case "extra_border":
          child.userData.externalMaps = this.collectionMaps.stitch;

          break;

        case "back_cushion":
          if ("25" === modelData.id || "25SW" === modelData.id) {
            child.userData.externalMaps =
              this.collectionMaps.backAndCushion25_25SW;
          } else if ("87" === modelData.id || "97" === modelData.id) {
            child.userData.externalMaps =
              this.collectionMaps.backAndCushion87_97;
          } else if ("98" === modelData.id) {
            child.userData.externalMaps = this.collectionMaps.backAndCushion98;
          } else {
            child.userData.externalMaps = this.collectionMaps.defaultCushion;
          }
          break;

        case "seat_cushion":
        case "seat_cushion_border":
        case "seat_cushion_unfinished":
        case "ottoman_top":
          if (["41", "42", "68", "OT", "SO", "CO"].includes(modelData.id)) {
            child.userData.externalMaps = this.collectionMaps.customCushion;
          } else if ("25" === modelData.id || "25SW" === modelData.id) {
            child.userData.externalMaps =
              this.collectionMaps.backAndCushion25_25SW;
          } else if ("87" === modelData.id || "97" === modelData.id) {
            child.userData.externalMaps =
              this.collectionMaps.backAndCushion87_97;
          } else if ("98" === modelData.id) {
            child.userData.externalMaps = this.collectionMaps.backAndCushion98;
          } else {
            child.userData.externalMaps = this.collectionMaps.defaultCushion;
          }

          break;

        default:
          console.warn("No external maps found for " + child.material.name);

          break;
      }
    } else if (this.collection === "luxury-motion") {
      switch (child.material.name) {
        case "back_inside":
        case "back_outside":
        case "front":
        case "extra_border":
        case "arm_inside":
        case "arm_outside":
        case "arm_panel":
        case "console":
          child.userData.externalMaps = this.collectionMaps.stitch;

          break;

        case "seat_cushion":
        case "seat_cushion_unfinished":
        case "seat_cushion_border":
        case "ottoman_top":
          child.userData.externalMaps = this.collectionMaps.defaultCushion;
          break;
        case "back_cushion":
        case "headrest_top":
        case "headrest_bottom":
          let backCushionMapKey = [
            "back_cushion_916_920_968",
            "back_cushion_949_950_960",
            "back_cushion_951",
            "back_cushion_962",
          ].find((key) => key.includes(this.selectedArmType.sku));

          if (backCushionMapKey) {
            child.userData.externalMaps =
              this.collectionMaps[backCushionMapKey];
          }
          break;

        default:
          console.warn("No external maps found for " + child.material.name);

          break;
      }
    } else if (this.collection === "loft-living") {
      switch (child.material.name) {
        default:
          console.warn("No external maps found for " + child.material.name);

          break;
      }
    } else if (this.collection === "simply-me") {
      switch (child.material.name) {
        default:
          console.warn("No external maps found for " + child.material.name);

          break;
      }
    }
  }

  // Model maps loader with fallback for missing maps
  async loadObjectMappedTextures(input) {
    let obj = {};

    const loadTexture = (url) => {
      return new Promise((resolve) => {
        this.textureLoader.load(
          url,
          (result) => {
            result.wrapS = RepeatWrapping;
            result.wrapT = RepeatWrapping;
            result.flipY = false;
            result.userData.url = url;
            resolve(result);
          },
          undefined,
          (err) => {
            console.error(
              `Model map load error: ${url} not found. Using Blank map! (Please check resources folder)`,
            );

            const fallback = url.includes("_Normal")
              ? this.blankNormal
              : this.blankAO;

            resolve(fallback);
          },
        );
      });
    };

    const promises = [];
    let texturePromise;
    for (const [inputKey, inputValue] of Object.entries(input)) {
      obj[inputKey] = {};

      for (const [key, texture] of Object.entries(inputValue)) {
        obj[inputKey][key] = {};
        //BYO / Sectionals
        if (typeof texture === "object") {
          for (const [mapKey, mapValue] of Object.entries(texture)) {
            if (typeof mapValue === "string") {
              texturePromise = loadTexture(mapValue).then(
                (loadedTexture) => (obj[inputKey][key][mapKey] = loadedTexture),
              );

              if (texturePromise) promises.push(texturePromise);
            } else if (typeof mapValue === "object") {
              if (mapValue.isTexture) obj[inputKey][key][mapKey] = mapValue;
            }
          }
        } else if (typeof texture === "string") {
          // static frames
          texturePromise = loadTexture(texture).then(
            (loadedTexture) => (obj[inputKey][key] = loadedTexture),
          );

          if (texturePromise) promises.push(texturePromise);
        }
      }
    }

    await Promise.all(promises);

    return obj;
  }

  async getArm(armUrl) {
    let arm = this.loadedArms.find((arm) => arm.userData.url === armUrl);

    if (!arm) {
      arm = (await this.loadObject(armUrl)).scene;

      arm.userData.url = armUrl;
      arm.userData.sku = this.selectedArmType.sku;
      arm.userData.arm = true;

      this.loadedArms.push(arm);
    } else {
      arm.clone();
    }

    await this.loadAndConnectLegs(arm);

    return arm.clone();
  }

  async loadArm(newModel, modelData, draggedModel = false) {
    let path = `${this.resourcesPath}/models/${this.brand.modelPath}/${this.collection
      }/`;

    let leftArmURL = draggedModel
      ? `${path}low-poly/side-${this.selectedArmType.sku}-L.gltf`
      : `${path}side-${this.selectedArmType.sku}-L.gltf`;
    let rightArmUrl = draggedModel
      ? `${path}low-poly/side-${this.selectedArmType.sku}-R.gltf`
      : `${path}side-${this.selectedArmType.sku}-R.gltf`;

    switch (modelData.arm.position) {
      case "left":
        await this.getArm(leftArmURL);

        break;
      case "right":
        await this.getArm(rightArmUrl);

        break;
      case "both":
        await this.getArm(leftArmURL);
        await this.getArm(rightArmUrl);
        break;

      default:
        console.error("Invalid arm position");
        break;
    }

    this.connectArmSockets(newModel, modelData, draggedModel);
  }

  nameLegClone(socketName) {
    return socketName.includes("_front") ? "Leg_Clone_Front" : "Leg_Clone";
  }

  async loadAndConnectLegs(model) {
    let sockets = model.getObjectByName("sockets").children;

    for (const socket of sockets) {
      if (socket.name.includes("leg")) {
        let legClone = this.collectionLeg.clone();
        legClone.userData.attachedToSocket = socket.name;

        let legPosition = legClone.getObjectByName("leg")?.position;

        this.setRotationFromObject(legClone, socket);

        legClone.position.copy(socket.position);

        if (legPosition) legClone.position.add(legPosition.negate());

        legClone.updateMatrixWorld();
        legClone.name = this.nameLegClone(socket.name);
        model.add(legClone);
      } else if (socket.name.includes("default_support")) {
        let defaultSupportlegClone = this.defaultSupportLeg.clone();
        defaultSupportlegClone.userData.attachedToSocket = socket.name;

        let defaultSupportLegPosition =
          defaultSupportlegClone.getObjectByName("default_support")?.position;

        this.setRotationFromObject(defaultSupportlegClone, socket);

        defaultSupportlegClone.position.copy(socket.position);
        if (defaultSupportLegPosition)
          defaultSupportlegClone.position.add(
            defaultSupportLegPosition.negate(),
          );

        defaultSupportlegClone.updateMatrixWorld();
        defaultSupportlegClone.name = "Default_Support_Leg_Clone";
        model.add(defaultSupportlegClone);
      }
    }
  }

  rotateObjAroundPoint(object, point = new Vector3(), angle = 0) {
    const yAxis = new Vector3(0, 1, 0);
    yAxis.normalize();

    const pivot = point.clone();

    object.position.sub(pivot);
    object.position.applyAxisAngle(yAxis, angle);
    object.position.add(pivot);

    object.rotateOnAxis(yAxis, angle);

    object.updateMatrixWorld();
  }

  connectArmSockets(newModel, modelData, draggedModel = false) {
    newModel.userData.model = modelData;
    let sockets = newModel.getObjectByName("sockets")?.children;

    if (sockets) {
      for (const socket of sockets) {
        if (
          socket.name.includes("side_L") &&
          (modelData.arm.position.includes("left") ||
            modelData.arm.position.includes("both"))
        ) {
          let leftArmClone = draggedModel
            ? this.loadedArms
              .find(
                (x) =>
                  x.userData.sku === this.selectedArmType.sku &&
                  x.userData.url.includes(`-L`) &&
                  x.userData.url.includes(`low-poly`),
              )
              .clone()
            : this.loadedArms
              .find(
                (x) =>
                  x.userData.sku === this.selectedArmType.sku &&
                  x.userData.url.includes(`-L`),
              )
              .clone();

          let leftArmSocketPosition =
            leftArmClone.getObjectByName("side_L").position;

          // socket.getWorldQuaternion(leftArmClone.quaternion);
          // leftArmClone.updateMatrixWorld();

          leftArmClone.position.copy(socket.position);
          leftArmClone.position.add(leftArmSocketPosition.negate());

          this.rotateObjAroundPoint(
            leftArmClone,
            socket.position,
            socket.rotation.y,
          );

          leftArmClone.updateMatrixWorld();

          if (draggedModel) {
            leftArmClone.userData.temp = true;
          } else {
            leftArmClone.userData.temp = false;
          }
          leftArmClone.name = `Left_Arm_${this.selectedArmType.sku}_Clone`;
          newModel.add(leftArmClone);
        } else if (
          socket.name.includes("side_R") &&
          (modelData.arm.position.includes("right") ||
            modelData.arm.position.includes("both"))
        ) {
          let rightArmClone = draggedModel
            ? this.loadedArms
              .find(
                (x) =>
                  x.userData.sku === this.selectedArmType.sku &&
                  x.userData.url.includes(`${this.selectedArmType.sku}-R`) &&
                  x.userData.url.includes(`low-poly`),
              )
              .clone()
            : this.loadedArms
              .find(
                (x) =>
                  x.userData.sku === this.selectedArmType.sku &&
                  x.userData.url.includes(`${this.selectedArmType.sku}-R`),
              )
              .clone();
          let rightArmSocketPosition =
            rightArmClone.getObjectByName("side_R").position;

          // socket.getWorldQuaternion(rightArmClone.quaternion);
          // rightArmClone.updateMatrixWorld();

          rightArmClone.position.copy(socket.position);

          rightArmClone.position.add(rightArmSocketPosition.negate());

          this.rotateObjAroundPoint(
            rightArmClone,
            socket.position,
            socket.rotation.y,
          );

          rightArmClone.updateMatrixWorld();

          if (draggedModel) {
            rightArmClone.userData.temp = true;
          } else {
            rightArmClone.userData.temp = false;
          }
          rightArmClone.name = `Right_Arm_${this.selectedArmType.sku}_Clone`;
          newModel.add(rightArmClone);
        }
      }
    }
  }

  disposeMaterial(material) {
    Object.values(material).forEach((value) => {
      if (value instanceof Texture) value.dispose();
    });
    material.dispose();
  }

  clearModel() {
    this.model.traverse((child) => {
      child.geometry?.dispose();
      if (child.material) this.disposeMaterial(child.material);
    });
    this.model.clear();
  }

  clearLoadedModels() {
    if (this.loadedModels.length !== 0)
      this.loadedModels.forEach((model) => {
        model.scene.traverse((child) => {
          child.geometry?.dispose();
          if (child.material) this.disposeMaterial(child.material);
        });
      });
    if (this.loadedModels) this.loadedModels = [];

    if (this.loadedArms) this.loadedArms = [];
  }

  setSize(model) {
    const box = new Box3().setFromObject(model);
    const size = box.getSize(new Vector3());
    const center = box.getCenter(new Vector3());

    model.userData.bounding = { box, size, center };
  }

  setCurrentStaticModelsData() {
    this.currentBrandStaticFramesData = this.data.frames.filter(
      (frame) => frame.brandId === this.brand.id && frame.staticFrame,
    );
  }

  setCollection(string) {
    // TODO: FIX ARRAY STRING PASS OF COLLECTION
    if (string) {
      let output;
      if (typeof string === "string") {
        output = string.split(" ").join("-").toLowerCase();
      } else {
        output = string[0].split(" ").join("-").toLowerCase();
      }
      return (this.collection = output);
    }
  }

  setMaterialType(type) {
    if (type === this.selectedMaterialType) return;
    this.selectedMaterialType = type;
  }

  async setFloor() {
    let geo = new PlaneGeometry(100, 100);
    let mat = new MeshStandardMaterial();
    this.plane = new Mesh(geo, mat);

    this.plane.position.set(0, 0, 0);
    this.plane.rotation.set(Math.PI / -2, 0, 0);

    this.plane.visible = false;
    this.plane.receiveShadow = false; // because of contact shadow
    this.plane.name = "Floor plane";

    this.scene.add(this.plane);
    let shadowMat = new ShadowMaterial({
      opacity: 0.15,
    });

    this.shadowPlane = new Mesh(geo, shadowMat);
    this.shadowPlane.position.set(0, 0, 0);
    this.shadowPlane.rotation.set(Math.PI / -2, 0, 0);

    this.shadowPlane.visible = false;
    this.shadowPlane.receiveShadow = false;

    this.shadowPlane.name = "Shadow Plane";

    this.scene.add(this.shadowPlane);
  }

  // UPDATERS

  update() {
    if (this.webglFailed) return;
    this._rafId = requestAnimationFrame(this.update);

    var delta = this.clock.getDelta();
    this.frameDelta += delta;

    // Keep tweens ticking even between renders
    TWEEN.update();
    if (TWEEN.getAll().length > 0) this.needsRender = true;

    // OrbitControls damping needs continuous updates while settling
    this.controls.update();

    // Only flag a render if the camera actually moved (threshold to ignore damping drift)
    var cameraMoved =
      this._prevCameraPosition.distanceToSquared(this.camera.position) >
      1e-10 ||
      this._prevControlsTarget.distanceToSquared(this.controls.target) > 1e-10;
    if (cameraMoved) {
      this.needsRender = true;
      this._prevCameraPosition.copy(this.camera.position);
      this._prevControlsTarget.copy(this.controls.target);
    }

    // Keep rendering continuously during drag operations
    if (this.isDragging) this.needsRender = true;

    // Animation mixer - only render when animations are actually playing
    if (this.mixer) {
      this.mixer.update(delta);
      if (this._isAnimationPlaying) {
        this.needsRender = true;
        this.needsShadowUpdate = true;
      }
    }

    // Multi-frame requests (e.g. after texture swap, render a few extra frames)
    if (this._renderFrames > 0) {
      this.needsRender = true;
      this._renderFrames--;
    }

    // CSS2D labels (lightweight DOM updates) — run every tick during drag for smooth + buttons
    if (this.css2DRenderer && this.isDragging) {
      this.css2DRenderer.render(this.scene, this.camera);
    }

    if (!this.needsRender) return;

    // FPS throttle
    if (this.frameDelta < this.frameInterval) return;
    this.frameDelta = this.frameDelta % this.frameInterval;

    this.needsRender = false;

    this.renderer.render(this.scene, this.camera);
    this.stats?.update();

    // label renderer
    if (this.css2DRenderer) {
      this.css2DRenderer.render(this.scene, this.camera);

      if (this.leftDimensions && this.rightDimensions) {
        const leftLine = this.leftDimensions.find((x) =>
          x.name.includes("height line"),
        );
        const rightLine = this.rightDimensions.find((x) =>
          x.name.includes("height line"),
        );

        if (leftLine && rightLine) {
          const closerLeft =
            this.camera.position.distanceTo(leftLine.position) <
            this.camera.position.distanceTo(rightLine.position);

          sideDimensionsVisibility(
            "left",
            closerLeft,
            this.leftDimensions,
            this.rightDimensions,
          );
          sideDimensionsVisibility(
            "right",
            !closerLeft,
            this.leftDimensions,
            this.rightDimensions,
          );
        }
      }
    }

    // contact shadow (only update when scene geometry changes)
    if (
      this.preset.contactShadow &&
      this.needsShadowUpdate &&
      !this._shadowDisabledForDrag
    ) {
      this.ensureRenderTarget();
      this.setShadowVisibility(true);
      this.updateContactShadow();
      this.needsShadowUpdate = false;
    }
  }

  ensureRenderTarget() {
    if (!this.renderTarget) {
      const RES = this.preset.renderTargetRes;

      this.renderTarget = new WebGLRenderTarget(RES, RES);
      this.renderTarget.texture.generateMipmaps = false;
    }
  }

  setShadowVisibility(visible) {
    this.scene.children.forEach(function (child) {
      if (child.name === "Shadow Group") child.visible = visible;
    });
    if (this.shadowGroup) this.shadowGroup.visible = visible;
  }

  updateContactShadow() {
    const initialBackground = this.scene.background;
    this.scene.background = null;

    const initialClearAlpha = this.renderer.getClearAlpha();
    this.renderer.setClearAlpha(0);

    if (this.shadowGroup?.children.length > 0) {
      this.shadowGroup.children[0].visible = false;
      this.renderer.setRenderTarget(this.renderTarget);
      if (this.renderer && this.scene && this.shadowCamera) {
        this.renderer.render(this.scene, this.shadowCamera);
      }
      this.shadowGroup.children[0].visible = true;
    }

    this.scene.overrideMaterial = null;
    blurShadow(1.1, this.renderTarget, this.shadowCamera, this.renderer);
    blurShadow(1.1 * 0.4, this.renderTarget, this.shadowCamera, this.renderer);

    this.renderer.setRenderTarget(null);
    this.renderer.setClearAlpha(initialClearAlpha);
    this.scene.background = initialBackground;

    if (this.updateCallbacks) {
      this.updateCallbacks.forEach((cb) => cb());
    }
  }

  //TODO: This is currently used only for welt and flange (Rework to work for all materials)
  getFallbackMaterial(name) {
    // console.log("Getting fallback for material:", name);
    const hasMaterial = (materialName) =>
      this.materials.some((material) => material.name === materialName);

    const getMaterial = (materialName) =>
      this.materials.find((material) => material.name === materialName);

    // Rule: *_welt -> welt -> *_welt -> * -> main
    if (name.endsWith("_welt")) {
      const baseWithoutWelt = name.slice(0, -5);

      // Try: welt
      if (hasMaterial("welt")) {
        return getMaterial("welt");
      }

      // Rule: self
      if (hasMaterial(name)) {
        return getMaterial(name);
      }

      // Try: *
      if (hasMaterial(baseWithoutWelt)) {
        return getMaterial(baseWithoutWelt);
      }

      return getMaterial("main");
    }

    if (name.endsWith("_flange")) {
      const baseWithoutFlange = name.slice(0, -7);

      // Try: flange
      if (hasMaterial("flange")) {
        return getMaterial("flange");
      }

      // Rule: self
      if (hasMaterial(name)) {
        return getMaterial(name);
      }

      // Try: *
      if (hasMaterial(baseWithoutFlange)) {
        return getMaterial(baseWithoutFlange);
      }

      return getMaterial("main");
    }
  }

  async updateTexture(model = this.model, draggedModel = false) {
    this.materialNamesInsideModelWithBake = [];
    this.materialsWithMainFallback = [];
    for (const child of model.children) {
      child.traverse((element) => {
        element.castShadow = true;
        element.receiveShadow = true;
        //Excludes LineBasicMaterial
        if (element.material && element.material.type !== "LineBasicMaterial") {
          if (draggedModel) {
            if (!child.userData.temp) {
              if (element.name.includes("Arm")) {
                element.userData.temp = true;
              }
            }
          }


          // TODO: Forced _welt material to not fallback to found material ** Will be removed once getFallbackMaterial(materialName) global function is implemented for all materials
          let material = this.materials.find(
            (material) => material.name === element.material.name,
          );



          if (!material) {

            if (element.material.name === 'Top' || element.material.name === 'Base') {
              material = this.materials.find(material => material.name === 'main');
            }
            //First check if it fallbacks on main material
            if (
              this.materialFallbacksOnMain(element.material.name) ||
              element.material.name.includes("welt") ||
              element.material.name.includes("flange") ||
              element.material.name.includes("button") ||
              element.material.name.includes("gimp") ||
              element.material.name.includes("band")
            ) {
              // TODO: These if statements _welt and _flange will be removed once getFallbackMaterial(materialName) global function is implemented for all materials
              if (
                element.material.name.includes("_welt") ||
                element.material.name.includes("_flange")
              ) {
                material = this.getFallbackMaterial(element.material.name);
              } else {
                material = this.materials.find(
                  (material) => material.name === "main",
                );
              }

              this.materialsWithMainFallback.push(element.material.name);
            }

            //wood materials condition
            if (
              element.material.name.includes("wood") ||
              element.material.name.includes("woodMat")
            ) {
              material = this.materials.find(
                (material) => material.name === "wood",
              );
            }

            //this material condition should be removed only if confirmed that it doesnt exist in any model
            if (element.material.name === "frame_base") {
              material = this.materials.find(
                (material) => material.name === "unfinished",
              );
            }

            // welt_fixed should behave like regular welt material
            if (
              element.material.name === "welt_fixed" &&
              this.materials.find((material) => material.name === "welt")
            ) {
              material = this.materials.find(
                (material) => material.name === "welt",
              );
            }
          }

          if (material) {
            if (material.map) {
              if (
                element.material.name.includes("unfinished") &&
                this.brand.id === "BY"
              ) {
                // seat_cushion_unfinished as an example needs to override map with color and override roughness
                element.material.color = this.materials.find(
                  (mat) => mat.name === "unfinished",
                ).color;

                element.material.roughness = 1;
                element.material.metalness = 0;
              } else {
                element.material.map = material.map;
                element.material.map.colorSpace = SRGBColorSpace;
                element.material.map.channel = 0;

              }
            }
            // Set roughness map or remove if roughnessMap is left from old fabric
            if (material.roughnessMap) {
              element.material.roughness = 1;
              element.material.roughnessMap = material.roughnessMap;
              if (element.material.map)
                element.material.roughnessMap.repeat =
                  element.material.map.repeat;
            } else {
              material.roughness
                ? (element.material.roughness = material.roughness)
                : (element.material.roughness = 0.8);
              element.material.roughnessMap = null;
            }

            //SET sheen properties
            if (material.sheen) {
              element.material.sheen = material.sheen;
            }
            if (material.sheenRoughness != null) {
              element.material.sheenRoughness = material.sheenRoughness;
            }
            //Failsafe condition if material passed is not type MeshPhysicalMaterial
            if (material.sheenColor) {
              if (element.material.sheenColor) {
                element.material.sheenColor.set(material.sheenColor);
              } else {
                console.warn(
                  `Property sheenColor couldn't be set, ${element.material.name
                  } is not type of MeshPhysicalMaterial`,
                );
              }
            }
            if (material.sheenColorMap) {
              element.material.sheenColorMap = material.sheenColorMap;

              if (element.material.map)
                element.material.sheenColorMap.repeat =
                  element.material.map.repeat;
            } else {
              element.material.sheenColorMap = null;
              element.material.sheen = 0;
            }

            if (material.normalMap) {
              element.material.normalMap = material.normalMap;

              if (element.material.map)
                element.material.normalMap.repeat =
                  element.material.map.repeat;
            } else {
              element.material.normalMap = this.blankNormal;
            }

            if (material.aoMap) {
              element.material.aoMap = material.aoMap;

              if (element.material.map)
                element.material.aoMap.repeat = element.material.map.repeat;
              element.material.normalMap.channel = 0;
            } else {
              element.material.aoMap = this.blankAO;
            }

            if (material.color) {
              element.material.color = material.color;
            }

          }

          if (this.materialFallbacksOnMain(element.material.name)) {
            //definishe uv1 ako ne postoji onda dodeljuje prvi uv
            element.material.defines.USE_UV1 = "";
            if (element.geometry.attributes.uv1)
              element.material.defines.MAP_UV1 = `uv1`;
            else element.material.defines.MAP_UV1 = `uv`;
            //Ao map is baked on second uv set
            if (element.material.aoMap) {
              element.material.aoMap.channel = 1;
            }

            // console.log(material.colorCorrection);

            this.modifiedShader(
              element.material,
              material.colorCorrection || this.saturation,
            );
          }

          if (
            this.brand.id === "BY" &&
            this.staticFrame &&
            (element.name === "Back_Outside" ||
              element.name === "Arm_Outside") &&
            element.name !== "Back_Inside"
          ) {
            if (element.material.aoMap) {
              element.material.aoMap.channel = 1;
              element.material.aoMapIntensity = 2;
            }
          }

          element.material.needsUpdate = true;
        }
      });
    }

    // Render a few frames to let shaders compile and textures upload
    this.requestRender(5);
  }

  updateModel(model = this.model) {
    this.model.traverse((child) => {
      if (child.name === "Arm_Group") {
        child.children.forEach((child) => {
          child.visible = child.name.includes(this.selectedArmType.sku);
        });
      }

      if (child.name === "Power_Button_Group") {
        child.children.forEach((child) => {
          child.visible = child.name.includes(this.selectedArmType.sku);
        });
      }

      if (child.name === "Table_Top_Group") {
        child.children.forEach((child) => {
          child.visible = child.name.includes(this.selectedEdgeType.sku);
        });
      }
    })

  }
  // LIGHT SLIDER

  changeLightsSlider(angle) {
    let rad = (angle * Math.PI) / 180;

    this.lights.children.forEach((light) => {
      if (light.userData.baseAngle === undefined) {
        light.userData.radius = light.position.distanceTo(
          new Vector3(0, light.position.y, 0),
        );
        light.userData.baseAngle = Math.atan2(
          light.position.z,
          light.position.x,
        );
      }

      let totalAngle = light.userData.baseAngle + rad;
      let radius = light.userData.radius;

      light.position.x = radius * Math.cos(totalAngle);
      light.position.z = radius * Math.sin(totalAngle);
    });
    this.requestRender();
  }

  resetLightsSlider() {
    this.sceneOptions.lights.forEach((light) => {
      let lightChanged = this.lights.children.find(
        (x) => x.name === light.name && x.type !== "AmbientLight",
      );
      if (lightChanged) {
        lightChanged.position.x = light.position.x;
        lightChanged.position.y = light.position.y;
        lightChanged.position.z = light.position.z;
      }
    });
    this.requestRender();
  }

  // SCREENSHOT FUNCTIONS
  getScreenshot(preset) {
    let savedCameraPosition = new Vector3().copy(this.camera.position);
    let savedControlsTarget = new Vector3().copy(this.controls.target);

    switch (preset) {
      case "default":
      case "top":
      case "left":
      case "right":
        this.updateCameraPosition(preset, true);
        break;

      default:
        break;
    }

    this.modelConfiguration.elements.forEach((element, index) => {
      if (element.temp) {
        if (this.model.children[index].userData.model.id === element.id) {
          this.model.children[index].visible = false;
        }
      }
    });

    let planeVisible = false;
    if (this.plane.visible) {
      this.plane.visible = false;
      planeVisible = true;
    }

    this.renderer.render(this.scene, this.camera);

    if (planeVisible) {
      this.plane.visible = true;
    }

    this.modelConfiguration.elements.forEach((element, index) => {
      if (element.temp) {
        if (this.model.children[index].userData.model.id === element.id) {
          this.model.children[index].visible = true;
        }
      }
    });

    let dataURL = this.renderer.domElement.toDataURL();

    if (preset) {
      this.camera.position.copy(savedCameraPosition);
      this.controls.target.copy(savedControlsTarget);
    }

    return dataURL;
  }

  downloadScreenshot(preset) {
    let dataURL = this.getScreenshot(preset);

    let name = this.staticFrame
      ? this.selectedFrame.sku
      : this.modelConfiguration.elements.map((element) => element.id).join("-");

    const link = document.createElement("a");
    link.href = dataURL;
    link.download = `${name}.jpg`;
    link.click();
  }

  // Lights GUI
  createlightsGUI() {
    let lightFolder = this.gui.addFolder("Lights");
    lightFolder.close();

    this.updateCallbacks = this.updateCallbacks || [];
    this.lightHelpers = this.lightHelpers || new Map();

    const addLightHelper = (light) => {
      let helper = null;

      switch (light.type) {
        case "DirectionalLight":
          helper = new DirectionalLightHelper(light, 2, 0xff0000);
          break;
        case "SpotLight":
          helper = new SpotLightHelper(light, 0x0000ff);
          break;
      }

      if (helper) {
        this.scene.add(helper);
        helper.visible = light.visible;
        this.lightHelpers.set(light.uuid, helper);

        this.updateCallbacks.push(() => {
          let showHelper = light.userData.showHelper;

          helper.visible = light.visible && showHelper;
          if (helper.update) helper.update();
        });
      }
    };

    const setupLightGUI = (light, parentGui) => {
      let folder = parentGui.addFolder(light.name);

      addLightHelper(light);
      let helper = this.lightHelpers.get(light.uuid);

      folder.add(light, "visible").onChange((value) => {
        light.visible = value;
      });

      light.userData.showHelper = false;
      if (helper) {
        folder
          .add(light.userData, "showHelper")
          .name("helper visible")
          .onChange((value) => {
            helper.visible = light.visible && value;
          });
      }

      if (light.name !== "ambient_light")
        folder.add(light, "intensity", 0, 3, 0.0001);

      if (light.position && light.name !== "ambient_light") {
        folder.add(light.position, "x", -30, 30, 0.001);
        folder.add(light.position, "y", 0, 30, 0.001);
        folder.add(light.position, "z", -30, 30, 0.001);
      }

      if (light.shadow) {
        folder.add(light.shadow, "bias", -0.002, 0.002, 0.00001);

        let shadowHelper = new CameraHelper(light.shadow.camera);

        this.updateCallbacks.push(() => {
          shadowHelper.visible = light.visible;
          shadowHelper.update();
        });
      }

      folder.close();
    };

    this.lights.traverse((light) => {
      if (light.type.includes("Light")) {
        setupLightGUI(light, lightFolder);
      }
    });

    this.camera.traverse((light) => {
      if (light.type.includes("Light")) {
        setupLightGUI(light, lightFolder);
      }
    });

    setTimeout(() => {
      lightFolder.add(this.scene, "environmentIntensity", 0, 1, 0.0001);
    }, 500);
  }

  createStats() {
    this.stats = new Stats();
    this.stats.showPanel(0);
    this.stats.dom.style.position = "absolute";
    this.stats.dom.style.left = 0;
    this.stats.dom.style.top = 0;
    this.stats.dom.classList.add("player-stats");
    this.container.append(this.stats.dom);
  }

  // UTILITY FUNCTIONS
  async tryFetchModel(url) {
    try {
      const response = await fetch(url, { method: "HEAD" });

      if (!response.ok) return false;

      // Check if the content type is HTML, which indicates a 404 page
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("text/html")) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }
  getAppAreaMaterials(appArea) {
    return (
      this.applicationAreas.find((area) => area.dbValue === appArea)
        ?.targetedMaterials || null
    );
  }

  checkColorCorrection(fabric) {
    const colorCorrectionKeys = [
      "saturation",
      "brightness",
      "contrast",
      "red",
      "green",
      "blue",
    ];

    const hasColorCorrectionKeys = colorCorrectionKeys.some(
      (key) => key in fabric,
    );

    if (!hasColorCorrectionKeys) {
      return false;
    }

    const defaultColorCorrection = {
      saturation: "1.000",
      contrast: "1.040",
      brightness: "1.000",
      red: "1.000",
      green: "1.000",
      blue: "1.000",
    };

    function formatColorCorrection(fabric, defaults, keys) {
      return Object.fromEntries(
        keys.map((key) => {
          const value = fabric[key] || defaults[key];
          return [key, Number(value).toFixed(3)];
        }),
      );
    }

    let formatedColorCorrection = formatColorCorrection(
      fabric,
      defaultColorCorrection,
      colorCorrectionKeys,
    );

    return formatedColorCorrection;
  }

  checkSeatTypes(modelConfiratonArray) {
    let skus = modelConfiratonArray.elements.map((element) => element.id);
    function findSeatCushionSwitch(sku, framesData, collection) {
      let prop = framesData.find(
        (frame) =>
          frame.sku === sku &&
          frame.collection === collection &&
          frame.seatCushionSwitch,
      );
      return prop || false;
    }

    if (
      skus.some((sku) =>
        findSeatCushionSwitch(sku, this.data.frames, this.collection),
      )
    ) {
      window.dispatchEvent(new Event("seatCushionSwitchAvailable"));
    } else {
      window.dispatchEvent(new Event("seatCushionSwitchNotAvailable"));
    }
  }

  disposeObject(object) {
    if (object?.children.length !== 0) {
      object.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          let materials = Array.isArray(child.material)
            ? child.material
            : [child.material];
          materials.forEach((material) => {
            for (const key in material) {
              const materialValue = material[key];
              if (materialValue && materialValue.isTexture) {
                materialValue.dispose();
              }
            }
            material.dispose();
          });
        }
        if (child.texture) child.texture.dispose();
        object.remove(child);
      });
    }
  }

  setRotationFromObject(targetObject, referenceObject) {
    targetObject.rotation.x = referenceObject.rotation.x;
    targetObject.rotation.y = referenceObject.rotation.y;
    targetObject.rotation.z = referenceObject.rotation.z;
  }

  checkForStandardMaterial(scene) {
    scene.traverse((child) => {
      if (
        child.isMesh &&
        child.material &&
        child.material.type === "MeshStandardMaterial" &&
        this.materialFallbacksOnMain(child.material.name)
      ) {
        this.standardToPhysical(child);
      }
    });
  }

  freeControls() {
    this.controls.enabled = true;
    this.controls.minDistance = 0;
    this.controls.maxDistance = Infinity;
    this.controls.minPolarAngle = 0;
    this.controls.maxPolarAngle = Infinity;
    this.controls.minAzimuthAngle = 0;
    this.controls.maxAzimuthAngle = Infinity;
    this.controls.enablePan = true;
  }

  modifiedShader(material, color = this.saturation) {
    // Color correction parameters
    let saturation = color.saturation;
    let contrast = color.contrast;
    let brightness = color.brightness;
    let red = color.red;
    let green = color.green;
    let blue = color.blue;

    // ============================================
    // CACHE KEY: Force recompilation when textures or colors change
    // ============================================
    material.customProgramCacheKey = () => {
      const normalMapId =
        material.userData?.shaderMaps?.normalMap?.uuid || "none";
      const aoMapId = material.userData?.shaderMaps?.aoMap?.uuid || "none";

      return JSON.stringify({
        normalMap: normalMapId,
        aoMap: aoMapId,
        saturation,
        contrast,
        brightness,
        red,
        green,
        blue,
        hasNormalMap: material.normalMap !== null,
        hasAOMap: material.aoMap !== null,
        hasMap: material.map !== null,
      });
    };

    // ============================================
    // SHADER COMPILATION
    // ============================================
    material.onBeforeCompile = (shader) => {
      this.replaceShaderFiles(shader);
      // ============================================
      // UNIFORM SETUP: AO Map
      // ============================================
      if (material.aoMap) {
        shader.uniforms.textureAO = { value: null };
        shader.uniforms.textureAO.value =
          material?.userData?.shaderMaps?.aoMap || this.blankAO;
        shader.uniforms.textureAO.needsUpdate = true;

        shader.uniforms.useTextureAO = { value: 1.0 };
      } else {
        shader.uniforms.textureAO = { value: null };
        shader.uniforms.useTextureAO = { value: 0.0 };
      }
      // ============================================
      // UNIFORM SETUP: Texture Repeat
      // ============================================
      shader.uniforms.mapRepeatX = {
        value:
          material.map && material.map.repeat.x
            ? material.map?.repeat?.x?.toFixed(1)
            : 1,
      };

      shader.uniforms.mapRepeatY = {
        value:
          material.map && material.map.repeat
            ? material.map?.repeat?.y?.toFixed(1)
            : 1,
      };

      if (material.normalMap) {
        material.normalMap.channel = 0;
      }
      // ============================================
      // SHADER CODE: Color Correction (Map Fragment)
      // ============================================
      let mapFragment = `
      #ifdef USE_MAP
        vec4 sampledDiffuseColor = texture2D( map, vMapUv );

        #ifdef DECODE_VIDEO_TEXTURE
          // Inline sRGB decode for video textures
          sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
        #endif

        const float AvgLumR = 0.5;
        const float AvgLumG = 0.5;
        const float AvgLumB = 0.5;
        vec3 AvgLumin  = vec3(AvgLumR, AvgLumG, AvgLumB);
        const vec3 LumCoeff = vec3(0.2125, 0.7154, 0.0721);
        vec3 brightness  = sampledDiffuseColor.rgb * ${brightness};
        vec3 intensity = vec3(dot(brightness, LumCoeff));
        vec3 saturation  = mix(intensity, brightness, ${saturation});
        vec3 contrast  = mix(AvgLumin, saturation, ${contrast});
        vec3 color = vec3(${red}, ${green}, ${blue});

        diffuseColor = vec4(contrast * color * diffuse, sampledDiffuseColor.a);
      #endif
    `;

      // ============================================
      // SHADER CODE: Normal Map Blending
      // ============================================
      let normalFragmentMaps = `
      #ifdef USE_NORMALMAP_OBJECTSPACE
      
        normal = texture2D( normalMap, vNormalMapUv1 ); // overrides both flatShading and attribute normals
        #ifdef FLIP_SIDED
          normal = - normal;
        #endif
        #ifdef DOUBLE_SIDED
          normal = normal * faceDirection;
        #endif
        normal = normalize( normalMatrix * normal );
        
      #elif defined( USE_NORMALMAP_TANGENTSPACE )

        float repeatX = mapRepeatX;
        float repeatY = mapRepeatY;

        vec3 textureNormal = texture2D( normalMap2, vec2( vNormalMapUv.x * mapRepeatX , vNormalMapUv.y * mapRepeatY ) ).xyz * 2.0 - 1.0;
        vec3 bakeNormal = texture2D( normalMap, vNormalMapUv1 ).xyz * 2.0 - 1.0;

        vec3 mapN = mix(bakeNormal, textureNormal, 0.4);

        mapN.xy *= normalScale;
        normal = normalize( tbn * mapN );
        
      #elif defined( USE_BUMPMAP )
        normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
      #endif
    `;

      let normalMapParsFragment = `
      #ifdef USE_NORMALMAP
        uniform sampler2D normalMap;
        uniform sampler2D normalMap2;
        uniform vec2 normalScale;
        uniform float mapRepeatX;
        uniform float mapRepeatY;
      #endif

      #ifdef USE_NORMALMAP_OBJECTSPACE
        uniform mat3 normalMatrix;
      #endif

      #if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
        // Normal Mapping Without Precomputed Tangents
        // http://www.thetenthplanet.de/archives/1180
        mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
          vec3 q0 = dFdx( eye_pos.xyz );
          vec3 q1 = dFdy( eye_pos.xyz );
          vec2 st0 = dFdx( uv.st );
          vec2 st1 = dFdy( uv.st );
          vec3 N = surf_norm; // normalized
          vec3 q1perp = cross( q1, N );
          vec3 q0perp = cross( N, q0 );
          vec3 T = q1perp * st0.x + q0perp * st1.x;
          vec3 B = q1perp * st0.y + q0perp * st1.y;

          float det = max( dot( T, T ), dot( B, B ) );
          float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );

          return mat3( T * scale, B * scale, N );
        }
      #endif
    `;
      // ============================================
      // INJECT: Normal Map Shader Code
      // ============================================
      if (material.normalMap) {
        shader.uniforms.normalMap2 = { value: null };
        shader.uniforms.normalMap2.value =
          material.userData?.shaderMaps?.normalMap || this.blankNormal;
        shader.uniforms.normalMap2.needsUpdate = true;

        shader.fragmentShader = shader.fragmentShader.replace(
          "#include <normal_fragment_maps>",
          normalFragmentMaps,
        );
        shader.fragmentShader = shader.fragmentShader.replace(
          "#include <normalmap_pars_fragment>",
          normalMapParsFragment,
        );
      }
      // ============================================
      // INJECT: Color Correction Shader Code
      // ============================================
      if (material.map) {
        shader.fragmentShader = shader.fragmentShader.replace(
          "#include <map_fragment>",
          mapFragment,
        );
      }
      material.needsUpdate = true;
    };
  }

  uploadModel(input) {
    let uploadedModelUsesExternalTextures = false;
    this.inputedModelName = input["name"]
      .replace(".glb", "")
      .replace(".gltf", "");
    let someReader = new FileReader();
    someReader.onload = () => {
      let modelPath = someReader.result;
      this.loadModel({
        url: modelPath,
        uploadedModel: uploadedModelUsesExternalTextures,
      });
    };
    if (input) {
      someReader.readAsDataURL(input);
    }
  }

  checkTextures() {
    if (window.XMLHttpRequest) {
      // code for IE7+, Firefox, Chrome, Opera, Safari
      var http = new XMLHttpRequest();
    } else {
      //TODO: CHECK WHY TROWS ERROR
      console.log("ACTIVEXOBJECT REQUEST TODO");
      // var http = new ActiveXObject("Microsoft.XMLHTTP");
    }

    let missingFiles = "";

    function check(data) {
      for (const fabric of data) {
        let status = fabric.name;

        if (fabric.map) {
          http.open("HEAD", fabric.map, false);
          http.send();

          if (http.status === 404) {
            missingFiles +=
              fabric.name + " - Map Missing, should be - " + fabric.map + "\n";
          }
        }

        if (fabric.icon) {
          http.open("HEAD", fabric.icon, false);
          http.send();

          if (http.status === 404) {
            missingFiles +=
              fabric.name +
              " - Icon Missing, should be - " +
              fabric.icon +
              "\n";
          }
        }

        if (fabric.normalMap) {
          http.open("HEAD", fabric.normalMap, false);
          http.send();

          if (http.status === 404) {
            missingFiles +=
              fabric.name +
              " - Normal Map Missing, should be - " +
              fabric.normalMap +
              "\n";
          }
        }

        if (fabric.roughnessMap) {
          http.open("HEAD", fabric.roughnessMap, false);
          http.send();

          if (http.status === 404) {
            missingFiles +=
              fabric.name +
              " - Roughness Map Missing, should be - " +
              fabric.roughnessMap +
              "\n";
          }
        }

        if (status !== fabric.name) {
          missingFiles += status;
        }
      }
    }

    if (this.data.fabrics) check(this.data.fabrics);
    if (this.data.leathers) check(this.data.leathers);
    if (this.data.accentFabrics) check(this.data.accentFabrics);
    if (this.data.alternativeLeathers) check(this.data.alternativeLeathers);

    if (missingFiles.length > 0) alert(missingFiles);
  }

  createBlankTexture(width = 64, height = 64, type) {
    const size = width * height;
    const data = new Uint8Array(4 * size);

    let r, g, b;
    switch (type) {
      case "normal":
        r = 128;
        g = 128;
        b = 255;
        break;
      case "ao":
      default:
        r = 255;
        g = 255;
        b = 255;
        break;
    }

    for (let i = 0; i < size; i++) {
      const stride = i * 4;
      data[stride] = r;
      data[stride + 1] = g;
      data[stride + 2] = b;
      data[stride + 3] = 255;
    }

    const texture = new DataTexture(
      data,
      width,
      height,
      RGBAFormat,
      UnsignedByteType,
    );

    texture.magFilter = NearestFilter;
    texture.minFilter = NearestFilter;

    texture.needsUpdate = true;
    return texture;
  }

  async replaceShaderFiles(shader) {
    let uvParsVertex = `
                    #if defined( USE_UV ) || defined( USE_ANISOTROPY )
                    
                      varying vec2 vUv;
                    
                    #endif

                    #ifdef USE_MAP
                    
                      uniform mat3 mapTransform;
                      varying vec2 vMapUv;

                      #ifdef USE_UV1

                        varying vec2 vMapUv1; 

                      #endif
                    
                    #endif
                    #ifdef USE_ALPHAMAP
                    
                      uniform mat3 alphaMapTransform;
                      varying vec2 vAlphaMapUv;
                    
                    #endif
                    #ifdef USE_LIGHTMAP
                    
                      uniform mat3 lightMapTransform;
                      varying vec2 vLightMapUv;
                    
                    #endif
                    #ifdef USE_AOMAP
                    
                      uniform mat3 aoMapTransform;
                      varying vec2 vAoMapUv;

                      #ifdef USE_UV1

                        varying vec2 vAoMapUv1; 

                      #endif
                    
                    #endif
                    #ifdef USE_BUMPMAP
                    
                      uniform mat3 bumpMapTransform;
                      varying vec2 vBumpMapUv;
                    
                    #endif
                    #ifdef USE_NORMALMAP
                    
                      uniform mat3 normalMapTransform;
                      varying vec2 vNormalMapUv;
                      
                      #ifdef USE_UV1

                        varying vec2 vNormalMapUv1; 

                      #endif
                    
                    #endif
                    #ifdef USE_DISPLACEMENTMAP
                    
                      uniform mat3 displacementMapTransform;
                      varying vec2 vDisplacementMapUv;
                    
                    #endif
                    #ifdef USE_EMISSIVEMAP
                    
                      uniform mat3 emissiveMapTransform;
                      varying vec2 vEmissiveMapUv;
                    
                    #endif
                    #ifdef USE_METALNESSMAP
                    
                      uniform mat3 metalnessMapTransform;
                      varying vec2 vMetalnessMapUv;
                    
                    #endif
                    #ifdef USE_ROUGHNESSMAP
                    
                      uniform mat3 roughnessMapTransform;
                      varying vec2 vRoughnessMapUv;
                    
                    #endif
                    #ifdef USE_ANISOTROPYMAP
                    
                      uniform mat3 anisotropyMapTransform;
                      varying vec2 vAnisotropyMapUv;
                    
                    #endif
                    #ifdef USE_CLEARCOATMAP
                    
                      uniform mat3 clearcoatMapTransform;
                      varying vec2 vClearcoatMapUv;
                    
                    #endif
                    #ifdef USE_CLEARCOAT_NORMALMAP
                    
                      uniform mat3 clearcoatNormalMapTransform;
                      varying vec2 vClearcoatNormalMapUv;
                    
                    #endif
                    #ifdef USE_CLEARCOAT_ROUGHNESSMAP
                    
                      uniform mat3 clearcoatRoughnessMapTransform;
                      varying vec2 vClearcoatRoughnessMapUv;
                    
                    #endif
                    #ifdef USE_SHEEN_COLORMAP
                    
                      uniform mat3 sheenColorMapTransform;
                      varying vec2 vSheenColorMapUv;
                    
                    #endif
                    #ifdef USE_SHEEN_ROUGHNESSMAP
                    
                      uniform mat3 sheenRoughnessMapTransform;
                      varying vec2 vSheenRoughnessMapUv;
                    
                    #endif
                    #ifdef USE_IRIDESCENCEMAP
                    
                      uniform mat3 iridescenceMapTransform;
                      varying vec2 vIridescenceMapUv;
                    
                    #endif
                    #ifdef USE_IRIDESCENCE_THICKNESSMAP
                    
                      uniform mat3 iridescenceThicknessMapTransform;
                      varying vec2 vIridescenceThicknessMapUv;
                    
                    #endif
                    #ifdef USE_SPECULARMAP
                    
                      uniform mat3 specularMapTransform;
                      varying vec2 vSpecularMapUv;
                    
                    #endif
                    #ifdef USE_SPECULAR_COLORMAP
                    
                      uniform mat3 specularColorMapTransform;
                      varying vec2 vSpecularColorMapUv;
                    
                    #endif
                    #ifdef USE_SPECULAR_INTENSITYMAP
                    
                      uniform mat3 specularIntensityMapTransform;
                      varying vec2 vSpecularIntensityMapUv;
                    
                    #endif
                    #ifdef USE_TRANSMISSIONMAP
                    
                      uniform mat3 transmissionMapTransform;
                      varying vec2 vTransmissionMapUv;
                    
                    #endif
                    #ifdef USE_THICKNESSMAP
                    
                      uniform mat3 thicknessMapTransform;
                      varying vec2 vThicknessMapUv;
                    
                    #endif
                    `;
    let uvVertex = `
                    #if defined( USE_UV ) || defined( USE_ANISOTROPY )
                    
                      vUv = vec3( uv, 1 ).xy;
                    
                    #endif

                    #ifdef USE_MAP
                    
                      vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;

                      #if defined( USE_UV1 )

                      vMapUv1 = ( mapTransform * vec3( MAP_UV1 , 1 ) ).xy;

                      #endif
                    
                    #endif
                    #ifdef USE_ALPHAMAP
                    
                      vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
                    
                    #endif
                    #ifdef USE_LIGHTMAP
                    
                      vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
                    
                    #endif
                    #ifdef USE_AOMAP
                    
                      vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;

                      #if defined( USE_UV1 )

                        vAoMapUv1 = ( aoMapTransform * vec3( MAP_UV1 , 1 ) ).xy;

                      #endif
                    
                    #endif
                    #ifdef USE_BUMPMAP
                    
                      vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
                    
                    #endif
                    #ifdef USE_NORMALMAP
                    
                      vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;

                      #if defined( USE_UV1 )

                        vNormalMapUv1 = ( normalMapTransform * vec3( MAP_UV1 , 1 ) ).xy;

                      #endif
                    
                    #endif
                    #ifdef USE_DISPLACEMENTMAP
                    
                      vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
                    
                    #endif
                    #ifdef USE_EMISSIVEMAP
                    
                      vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
                    
                    #endif
                    #ifdef USE_METALNESSMAP
                    
                      vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
                    
                    #endif
                    #ifdef USE_ROUGHNESSMAP
                    
                      vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
                    
                    #endif
                    #ifdef USE_ANISOTROPYMAP
                    
                      vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
                    
                    #endif
                    #ifdef USE_CLEARCOATMAP
                    
                      vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
                    
                    #endif
                    #ifdef USE_CLEARCOAT_NORMALMAP
                    
                      vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
                    
                    #endif
                    #ifdef USE_CLEARCOAT_ROUGHNESSMAP
                    
                      vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
                    
                    #endif
                    #ifdef USE_IRIDESCENCEMAP
                    
                      vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
                    
                    #endif
                    #ifdef USE_IRIDESCENCE_THICKNESSMAP
                    
                      vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
                    
                    #endif
                    #ifdef USE_SHEEN_COLORMAP
                    
                      vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
                    
                    #endif
                    #ifdef USE_SHEEN_ROUGHNESSMAP
                    
                      vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
                    
                    #endif
                    #ifdef USE_SPECULARMAP
                    
                      vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
                    
                    #endif
                    #ifdef USE_SPECULAR_COLORMAP
                    
                      vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
                    
                    #endif
                    #ifdef USE_SPECULAR_INTENSITYMAP
                    
                      vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
                    
                    #endif
                    #ifdef USE_TRANSMISSIONMAP
                    
                      vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
                    
                    #endif
                    #ifdef USE_THICKNESSMAP
                    
                      vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
                    
                    #endif
                    `;
    let uvParsFragment = `
                    #if defined( USE_UV ) || defined( USE_ANISOTROPY )
                    
                      varying vec2 vUv;
                    
                    #endif

                    #ifdef USE_MAP
                    
                      varying vec2 vMapUv;
                      varying vec2 vMapUv1;
                    
                    #endif
                    #ifdef USE_ALPHAMAP
                    
                      varying vec2 vAlphaMapUv;
                    
                    #endif
                    #ifdef USE_LIGHTMAP
                    
                      varying vec2 vLightMapUv;
                    
                    #endif
                    #ifdef USE_AOMAP
                    
                      varying vec2 vAoMapUv;
                      varying vec2 vAoMapUv1;
                    
                    #endif
                    #ifdef USE_BUMPMAP
                    
                      varying vec2 vBumpMapUv;
                    
                    #endif
                    #ifdef USE_NORMALMAP
                    
                      varying vec2 vNormalMapUv;
                      varying vec2 vNormalMapUv1;
                    
                    #endif
                    #ifdef USE_EMISSIVEMAP
                    
                      varying vec2 vEmissiveMapUv;
                    
                    #endif
                    #ifdef USE_METALNESSMAP
                    
                      varying vec2 vMetalnessMapUv;
                    
                    #endif
                    #ifdef USE_ROUGHNESSMAP
                    
                      varying vec2 vRoughnessMapUv;
                    
                    #endif
                    #ifdef USE_ANISOTROPYMAP
                    
                      varying vec2 vAnisotropyMapUv;
                    
                    #endif
                    #ifdef USE_CLEARCOATMAP
                    
                      varying vec2 vClearcoatMapUv;
                    
                    #endif
                    #ifdef USE_CLEARCOAT_NORMALMAP
                    
                      varying vec2 vClearcoatNormalMapUv;
                    
                    #endif
                    #ifdef USE_CLEARCOAT_ROUGHNESSMAP
                    
                      varying vec2 vClearcoatRoughnessMapUv;
                    
                    #endif
                    #ifdef USE_IRIDESCENCEMAP
                    
                      varying vec2 vIridescenceMapUv;
                    
                    #endif
                    #ifdef USE_IRIDESCENCE_THICKNESSMAP
                    
                      varying vec2 vIridescenceThicknessMapUv;
                    
                    #endif
                    #ifdef USE_SHEEN_COLORMAP
                    
                      varying vec2 vSheenColorMapUv;
                    
                    #endif
                    #ifdef USE_SHEEN_ROUGHNESSMAP
                    
                      varying vec2 vSheenRoughnessMapUv;
                    
                    #endif
                    #ifdef USE_SPECULARMAP
                    
                      varying vec2 vSpecularMapUv;
                    
                    #endif
                    #ifdef USE_SPECULAR_COLORMAP
                    
                      varying vec2 vSpecularColorMapUv;
                    
                    #endif
                    #ifdef USE_SPECULAR_INTENSITYMAP
                    
                      varying vec2 vSpecularIntensityMapUv;
                    
                    #endif
                    #ifdef USE_TRANSMISSIONMAP
                    
                      uniform mat3 transmissionMapTransform;
                      varying vec2 vTransmissionMapUv;
                    
                    #endif
                    #ifdef USE_THICKNESSMAP
                    
                      uniform mat3 thicknessMapTransform;
                      varying vec2 vThicknessMapUv;
                    
                    #endif
                    `;

    shader.vertexShader = shader.vertexShader.replace(
      "#include <uv_pars_vertex>",
      uvParsVertex,
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <uv_pars_fragment>",
      uvParsFragment,
    );
    shader.vertexShader = shader.vertexShader.replace(
      "#include <uv_vertex>",
      uvVertex,
    );
  }

  // TEST FUNCTION THAT RETURNS APPLICATION AREAS
  // it should modelconfiguration.elements data and if arm exists also their application areas removing duplicates and assign array to this.availableApplicationAreas

  setAvailableApplicationAreas() {
    this.availableApplicationAreas = [];

    let applicationAreasFromModel = [];
    let applicationAreasFromArm = [];

    if (this.modelConfiguration.elements.length !== 0) {
      for (const element of this.modelConfiguration.elements) {
        let elementData = this.data.frames.find(
          (frame) =>
            frame.id === element.id && frame.collection === this.collection,
        );

        if (elementData && elementData.applicationAreas) {
          // Add application areas from model configuration elements
          applicationAreasFromModel.push(elementData.applicationAreas);
        }
      }

      if (this.selectedArmType) {
        let armData = this.data.collectionOptions.armTypes.find(
          (arm) => arm.sku === this.selectedArmType.sku,
        );

        if (armData && armData.applicationAreas) {
          // Add application areas from selected arm type
          applicationAreasFromArm.push(armData.applicationAreas);
        }
      }
    }

    this.availableApplicationAreas = Array.from(
      new Set(
        [...applicationAreasFromModel, ...applicationAreasFromArm].flatMap(
          Object.keys,
        ),
      ),
    );
  }

  getAllMaterialNames() {
    let materialNames = [];
    this.model.traverse((child) => {
      if (child.isMesh && child.material.name) {
        if (!materialNames.includes(child.material.name)) {
          materialNames.push(child.material.name);
        }
      }
    });

    return materialNames;
  }

  materialFallbacksOnMain(name) {
    const primary = [
      "back_pillows",
      "front_pillows",
      "throw_pillow",
      "back_inside_cushion",
      "arm",
      "back",
      "front",
      "wing",
      "seat",
      "ottoman",
      "headrest",
      "console",
      "main",
      "extra_border",
      "outwing",
      "arm_panel",
      "curtain",
    ];

    const secondary = [
      "inside",
      "outside",
      "top",
      "bottom",
      "footrest",
      "trim",
      "cushion",
    ];

    const tertiary = [
      "welt",
      "welt_fixed",
      "flange",
      "button",
      "unfinished",
      "band",
      "face",
      "panel",
      "sling",
      "gimp",
      "border",
      "complete",
    ];

    // Only allow exact "welt" or "button" or includes "welt" from tertiary
    if (name === "welt" || name === "button" || name.includes("welt"))
      return true;
    if (tertiary.includes(name)) return false; // reject all other clean tertiary-only names

    // Try to find a matching primary
    const matchedPrimary = primary.find(
      (p) => name === p || name.startsWith(p + "_"),
    );
    if (!matchedPrimary) return false;

    // Strip matched primary from name
    const rest = name.slice(matchedPrimary.length).replace(/^_/, "");
    const parts = rest ? rest.split("_") : [];

    if (parts.length === 0) {
      return true; // primary only
    }

    if (parts.length === 1) {
      const [p1] = parts;
      if (primary.includes(p1)) return true; // primary_primary
      if (secondary.includes(p1)) return true; // primary_secondary
      if (tertiary.includes(p1)) return true; // primary_tertiary
      return false;
    }

    if (parts.length === 2) {
      const [p1, p2] = parts;
      if (secondary.includes(p1) && tertiary.includes(p2)) {
        return true; // primary_secondary_tertiary
      }
      return false;
    }

    return false;
  }


  async setSaturationShaderValues() {
    let fabric = null;
    //TODO: When enabled in data use property from material to set values (current fabric null)

    this.saturation = {
      saturation:
        fabric?.colorCorrection?.saturation?.toFixed(3) ||
        this.defaultSaturation.saturation.toFixed(3),
      contrast:
        fabric?.colorCorrection?.contrast?.toFixed(3) ||
        this.defaultSaturation.contrast.toFixed(3),
      brightness:
        fabric?.colorCorrection?.brightness?.toFixed(3) ||
        this.defaultSaturation.brightness.toFixed(3),

      red:
        fabric?.colorCorrection?.red?.toFixed(3) ||
        this.defaultSaturation.red.toFixed(3),
      green:
        fabric?.colorCorrection?.green?.toFixed(3) ||
        this.defaultSaturation.green.toFixed(3),
      blue:
        fabric?.colorCorrection?.blue?.toFixed(3) ||
        this.defaultSaturation.blue.toFixed(3),
    };
  }

  recompileShader(
    saturation = parseFloat(
      this.filterParams?.saturation || this.defaultSaturation.saturation,
    ).toFixed(2),
    contrast = parseFloat(
      this.filterParams?.contrast || this.defaultSaturation.contrast,
    ).toFixed(2),
    brightness = parseFloat(
      this.filterParams?.brightness || this.defaultSaturation.brightness,
    ).toFixed(2),
    red = parseFloat(
      this.filterColors?.red || this.defaultSaturation.red,
    ).toFixed(2),
    green = parseFloat(
      this.filterColors?.green || this.defaultSaturation.green,
    ).toFixed(2),
    blue = parseFloat(
      this.filterColors?.blue || this.defaultSaturation.blue,
    ).toFixed(2),
  ) {
    let fragmentSegment = () => {
      return `
      #ifdef USE_MAP

            vec4 sampledDiffuseColor = texture2D( map, vMapUv );

            #ifdef DECODE_VIDEO_TEXTURE

              // use inline sRGB decode until browsers properly support SRGB8_ALPHA8 with video textures (#26516)

              sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );

            #endif

             const float AvgLumR = 0.5;
             const float AvgLumG = 0.5;
             const float AvgLumB = 0.5;
             vec3 AvgLumin  = vec3(AvgLumR, AvgLumG, AvgLumB);
             const vec3 LumCoeff = vec3(0.2125, 0.7154, 0.0721);

             vec3 brightness  = sampledDiffuseColor.rgb * ${this.saturation.brightness
        };
             vec3 intensity = vec3(dot(brightness, LumCoeff));
             vec3 saturation  = mix(intensity, brightness, ${this.saturation.saturation
        });
             vec3 contrast  = mix(AvgLumin, saturation, ${this.saturation.contrast
        });

             vec3 color = vec3(${this.saturation.red}, ${this.saturation.green
        }, ${this.saturation.blue});

             diffuseColor = vec4(contrast.r * color.r, contrast.g * color.g, contrast.b * color.b, sampledDiffuseColor.a);

             #endif
      `;
    };

    let mapFragment = fragmentSegment(
      saturation,
      contrast,
      brightness,
      red,
      green,
      blue,
    );

    this.model.traverse((child) => {
      if (
        child.material &&
        (child.material.name === "seat_cushion_unfinished" ||
          child.material.name === "unfinished")
      ) {
        child.material.onBeforeCompile = (shader) => {
          shader.fragmentShader = shader.fragmentShader.replace(
            "#include <map_fragment>",
            mapFragment,
          );
        };

        child.material.customProgramCacheKey = () => {
          return mapFragment;
        };

        child.material.needsUpdate = true;
      }
    });

    this.updateTexture();
  }

  saturationGUI() {
    // SATURATION / CONTRAST / BRIGHTNESS
    let scbFolder = this.colorGUI.children.find(
      (x) => x._title === "Saturation/Contrast/Brightness",
    );
    let saturation = scbFolder.children.find(
      (x) => x.property === "Saturation",
    );
    let contrast = scbFolder.children.find((x) => x.property === "Contrast");
    let brightness = scbFolder.children.find(
      (x) => x.property === "Brightness",
    );

    saturation.onFinishChange((value) => {
      value = value.toFixed(3);
      this.filterParams.saturation = String(value);
      this.saturation.saturation = String(value);

      this.recompileShader();
    });

    contrast.onFinishChange((value) => {
      value = value.toFixed(3);
      this.filterParams.contrast = String(value);
      this.saturation.contrast = String(value);
      this.recompileShader();
    });

    brightness.onFinishChange((value) => {
      value = value.toFixed(3);
      this.filterParams.brightness = String(value);
      this.saturation.brightness = String(value);
      this.recompileShader();
    });

    // RGB

    let rgbFolder = this.colorGUI.children.find((x) => x._title === "RGB");
    let red = rgbFolder.children.find((x) => x.property === "Red");
    let green = rgbFolder.children.find((x) => x.property === "Green");
    let blue = rgbFolder.children.find((x) => x.property === "Blue");

    red.onFinishChange((value) => {
      this.filterColors.red = String(value);
      this.saturation.red = String(value);
      this.recompileShader();
    });

    green.onFinishChange((value) => {
      this.filterColors.green = String(value);
      this.saturation.green = String(value);
      this.recompileShader();
    });

    blue.onFinishChange((value) => {
      this.filterColors.blue = String(value);
      this.saturation.blue = String(value);
      this.recompileShader();
    });
  }

  updateSaturationGUI(fabric) {
    this.filterParams.saturation =
      fabric.colorCorrection?.saturation?.toString() ||
      this.defaultSaturation.saturation.toString();
    this.filterParams.contrast =
      fabric.colorCorrection?.contrast?.toString() ||
      this.defaultSaturation.contrast.toString();
    this.filterParams.brightness =
      fabric.colorCorrection?.brightness?.toString() ||
      this.defaultSaturation.brightness.toString();
    this.filterColors.red =
      fabric.colorCorrection?.red?.toString() ||
      this.defaultSaturation.red.toString();
    this.filterColors.green =
      fabric.colorCorrection?.green?.toString() ||
      this.defaultSaturation.green.toString();
    this.filterColors.blue =
      fabric.colorCorrection?.blue?.toString() ||
      this.defaultSaturation.blue.toString();

    let scbFolder = this.colorGUI.children.find(
      (x) => x._title === "Saturation/Contrast/Brightness",
    );
    let saturationController = scbFolder.children.find(
      (x) => x.property === "Saturation",
    );
    let contrastController = scbFolder.children.find(
      (x) => x.property === "Contrast",
    );
    let brightnessController = scbFolder.children.find(
      (x) => x.property === "Brightness",
    );

    saturationController.setValue(this.filterParams.saturation);
    contrastController.setValue(this.filterParams.contrast);
    brightnessController.setValue(this.filterParams.brightness);

    let rgbFolder = this.colorGUI.children.find((x) => x._title === "RGB");
    let redController = rgbFolder.children.find((x) => x.property === "Red");
    let greenController = rgbFolder.children.find(
      (x) => x.property === "Green",
    );
    let blueController = rgbFolder.children.find((x) => x.property === "Blue");

    redController.setValue(this.filterColors.red);
    greenController.setValue(this.filterColors.green);
    blueController.setValue(this.filterColors.blue);
  }

  standardToPhysical(mesh) {
    let material = mesh.material;
    console.warn(
      `Converting to PhysicalMaterial: ${material.name} in mesh ${mesh.name}`,
    );

    const physical = new MeshPhysicalMaterial();
    physical.userData.originalMaterial = material;
    MeshStandardMaterial.prototype.copy.call(physical, mesh.material);
    physical.name = material.name;
    mesh.material = physical;
  }

  createSaturationGUI() {
    this.filterParams = {
      saturation: String(this.saturation?.saturation),
      contrast: String(this.saturation?.contrast),
      brightness: String(this.saturation?.brightness),
    };

    this.filterColors = {
      red: 1,
      green: 1,
      blue: 1,
    };

    this.colorGUI = this.gui.addFolder("Color Correction");

    let scbFolder = this.colorGUI.addFolder("Saturation/Contrast/Brightness");
    let scbParameters = {
      Saturation: parseFloat(this.filterParams.saturation),
      Contrast: parseFloat(this.filterParams.contrast),
      Brightness: parseFloat(this.filterParams.brightness),
    };
    let saturationController = scbFolder.add(
      scbParameters,
      "Saturation",
      0.001,
      3.999,
      0.0001,
    );
    let contrastController = scbFolder.add(
      scbParameters,
      "Contrast",
      0.8,
      1.15,
      0.0001,
    );
    let brightnessController = scbFolder.add(
      scbParameters,
      "Brightness",
      0.001,
      3.999,
      0.0001,
    );

    let rgbFolder = this.colorGUI.addFolder("RGB");
    let rgbParameters = {
      Red: parseFloat(this.filterColors.red),
      Green: parseFloat(this.filterColors.green),
      Blue: parseFloat(this.filterColors.blue),
    };
    let redController = rgbFolder.add(rgbParameters, "Red", 0.001, 1.5, 0.0001);
    let greenController = rgbFolder.add(
      rgbParameters,
      "Green",
      0.001,
      1.5,
      0.0001,
    );
    let blueController = rgbFolder.add(
      rgbParameters,
      "Blue",
      0.001,
      1.5,
      0.0001,
    );

    let resetFolder = this.colorGUI.addFolder("Reset Values").close();
    let resetParams = {
      resetSaturation: () => {
        saturationController.setValue(this.defaultSaturation.saturation);
        this.filterParams.saturation = this.defaultSaturation.saturation;
        this.recompileShader();
      },
      resetContrast: () => {
        contrastController.setValue(this.defaultSaturation.contrast);
        this.filterParams.contrast = this.defaultSaturation.contrast;
        this.recompileShader();
      },
      resetBrightness: () => {
        brightnessController.setValue(this.defaultSaturation.brightness);
        this.filterParams.brightness = this.defaultSaturation.brightness;
        this.recompileShader();
      },
      resetRed: () => {
        redController.setValue(this.defaultSaturation.red);
        this.filterColors.red = this.defaultSaturation.red;
        this.recompileShader();
      },
      resetGreen: () => {
        greenController.setValue(this.defaultSaturation.green);
        this.filterColors.green = this.defaultSaturation.green;
        this.recompileShader();
      },
      resetBlue: () => {
        blueController.setValue(this.defaultSaturation.blue);
        this.filterColors.blue = this.defaultSaturation.blue;
        this.recompileShader();
      },
      reset: () => {
        scbFolder.reset();
        if (saturationController.value === 1) {
          saturationController.setValue("1.00");
        }
        rgbFolder.reset();
      },
    };
    resetFolder.add(resetParams, "resetSaturation").name("Reset Saturation");
    resetFolder.add(resetParams, "resetContrast").name("Reset Contrast");
    resetFolder.add(resetParams, "resetBrightness").name("Reset Brightness");
    resetFolder.add(resetParams, "resetRed").name("Reset Red");
    resetFolder.add(resetParams, "resetGreen").name("Reset Green");
    resetFolder.add(resetParams, "resetBlue").name("Reset Blue");
    resetFolder.add(resetParams, "reset").name("Reset ALL");

    this.colorGUI.close();
  }

  createGuiContainer() {
    this.gui = new GUI({ title: "Options" });
    this.gui.domElement.id = "main-gui";
    this.gui.close();

    this.createlightsGUI();

    this.createSaturationGUI();
    this.saturationGUI();
  }

  isLowEndGPU() {
    try {
      const canvas = document.createElement("canvas"); // a throwaway canvas for GPU detection, it's never added to the DOM

      if (canvas) {
        const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
        if (gl) {
          const ext = gl.getExtension("WEBGL_debug_renderer_info");
          if (ext) {
            const renderer = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || "";
            const LOW_END_PATTERN =
              /Radeon\s*(HD\s*)?\d{3}[^0-9]|610M|Radeon\s+Graphics|Intel\s+(HD|UHD)\s+[456]\d{2,3}|Mali-[GT]\d+|PowerVR|Adreno\s+[1-5]\d{2}|SwiftShader/i;
            if (LOW_END_PATTERN.test(renderer)) return true;
          }
        }
      }
    } catch (e) { }

    const lowCores =
      navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
    const lowMemory =
      navigator.deviceMemory !== undefined && navigator.deviceMemory <= 4;
    return lowCores && lowMemory;
  }
}
