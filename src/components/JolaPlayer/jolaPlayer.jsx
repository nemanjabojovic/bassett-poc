import React, {
  useRef,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";

import Player from "./Player";

import "./jolaPlayer.css";

const JolaPlayer = forwardRef(
  ({ options, modelLoading, isCGIPlayerActive, isConfigOpen }, ref) => {
    const containerRef = useRef(null);
    const playerRef = useRef(null);
    const [webglFailed, setWebglFailed] = useState(false);
    const [playerReady, setPlayerReady] = useState(false);
    // const devUrls = ["localhost", "jolanas"];
    const devUrls = [];
    useEffect(() => {
      const container = containerRef.current;
      if (!container || playerRef.current) return;
      if (!container.id) container.id = options.containerId || "player";

      devUrls?.some((url) => window.location.href.includes(url))
        ? (options.gui = true)
        : (options.gui = false);

      playerRef.current = new Player(container.id, options);

      if (playerRef.current.webglFailed) {
        setWebglFailed(true);
        playerRef.current = null;
        return;
      }

      window.player = playerRef.current;
      setPlayerReady(true);
      window.dispatchEvent(new Event('playerReady'));

      const onResize = () => playerRef.current.resize();
      window.addEventListener("resize", onResize);

      return () => {
        window.removeEventListener("resize", onResize);
        playerRef.current.dispose?.();
        container.innerHTML = "";
        playerRef.current = null;
      };
    }, []);

    useImperativeHandle(ref, () => {
      var noop = function () {};
      if (!playerRef.current)
        return {
          loadFabric: noop,
          setConfiguration: noop,
          setBaseType: noop,
          onDragStart: noop,
          onDragEnd: noop,
          setStitchType: noop,
          resize: noop,
          setEditSelected: noop,
          clearConfiguration: noop,
          dispose: noop,
          player: function () {
            return null;
          },
          setNailOptionStandard: noop,
          setNailOptionStandard2: noop,
          resetLightsSlider: noop,
          changeLightsSlider: noop,
          updateCameraPosition: noop,
          setArmType: noop,
          setBackType: noop,
          onMouseClick: noop,
          loadModel: noop,
          setNailsVisible: noop,
          setNailColor: noop,
          setDimensionsVisible: noop,
          getDimensions: function () {
            return null;
          },
          getScreenshot: noop,
          setSwapElement: noop,
          getSwapState: function () {
            return null;
          },
          cancelSwap: noop,
          hasAnimation: function () {
            return false;
          },
          playAnimation: noop,
          loadFinish: noop,
          setWeltOption: noop,
          getAppAreaFinish: function () {
            return null;
          },
          removeAppAreaFinish: noop,
        };
      return {
        loadFabric: (fabric, materialname, updateTexture = false) =>
          playerRef.current.loadFabric(fabric, materialname, updateTexture),
        setConfiguration: (configuration) =>
          playerRef.current.setConfiguration(configuration),
        setBaseType: (type) => playerRef.current.setBaseType(type),
        onDragStart: (id, cameraUpdate = true) =>
          playerRef.current.onDragStart(id, cameraUpdate),
        onDragEnd: () => playerRef.current.onDragEnd(),
        setStitchType: (type) => playerRef.current.setStitchType(type),
        resize: () => playerRef.current.resize(),
        setEditSelected: (value) => playerRef.current.setEditSelected(value),
        clearConfiguration: () => playerRef.current.clearConfiguration(),
        dispose: () => playerRef.current.dispose(),
        player: () => {
          return playerRef.current;
        },
        setNailOptionStandard: (value) => {
          playerRef.current.setNailOptionStandard(value);
        },
        setNailOptionStandard2: (value) => {
          playerRef.current.setNailOptionStandard2(value);
        },
        // used only for client demo UI
        resetLightsSlider: () => {
          playerRef.current.resetLightsSlider();
        },
        changeLightsSlider: (value) => {
          playerRef.current.changeLightsSlider(value);
        },
        updateCameraPosition: (preset) => {
          playerRef.current.updateCameraPosition(preset);
        },
        setArmType: (armType) => {
          playerRef.current.setArmType(armType);
        },
        setBackType: (backType) => {
          playerRef.current.setBackType(backType);
        },
        onMouseClick: (e) => {
          playerRef.current.onMouseClick(e);
        },
        loadModel: (model) => {
          playerRef.current.loadModel(model);
        },
        setNailsVisible: (boolean) => {
          playerRef.current.setNailsVisible(boolean);
        },
        setNailColor: (color) => {
          playerRef.current.setNailColor(color);
        },
        setDimensionsVisible: (boolean) => {
          playerRef.current.setDimensionsVisible(boolean);
        },
        getDimensions: () => playerRef.current.getDimensions(),
        getScreenshot: (preset) => playerRef.current.getScreenshot(preset),
        setSwapElement: (selectedModel) => {
          playerRef.current.setSwapElement(selectedModel);
        },
        getSwapState: () => playerRef.current.getSwapState(),
        cancelSwap: () => playerRef.current.cancelSwap(),
        hasAnimation: () => playerRef.current.hasAnimation(),
        playAnimation: () => playerRef.current.playAnimation(),
        loadFinish: (finish) => playerRef.current.loadFinish(finish),
        setWeltOption: (weltOption, weltArea) =>
          playerRef.current.setWeltOption(weltOption, weltArea),
        getAppAreaFinish: (appArea) =>
          playerRef.current.getAppAreaFinish(appArea),
        removeAppAreaFinish: (appArea) =>
          playerRef.current.removeAppAreaFinish(appArea),
        setBackType: (type) => playerRef.current.setBackType(type),
      };
    }, [playerReady, webglFailed]);

    if (!options || !options.frame  || !options.data) {
      console.warn("JolaPlayer: invalid options, skipping init", options);
      return null;
    }

    if (webglFailed) {
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eeeff2', textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: "#666", fontSize: "14px" }}>
            3D viewer is not available on this device.
            <br />
            Please try enabling hardware acceleration in your browser settings.
          </p>
        </div>
      );
    }

    return (
      <div
        style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
        ref={containerRef}
      />
    );
  },
);

export default JolaPlayer;
