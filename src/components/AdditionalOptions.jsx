import React, { useState, useEffect } from "react";
import Button from "./Button";
import defaultView from "../assets/icons/defaultView.svg";
import rightView from "../assets/icons/rightView.svg";
import topView from "../assets/icons/topView.svg";
import leftView from "../assets/icons/leftView.svg";
import zoomIn from "../assets/icons/zoomIn.svg";
import camera from "../assets/icons/camera.svg";
import animationsIcon from "../assets/icons/animations.svg";
import dimensions from "../assets/icons/dimensions.svg";
import additionalOptionsIcon from "../assets/icons/additionalOptions.svg";

const AdditionalOptions = ({ isOpenAdditionalOption, setIsOpenAdditionalOption }) => {
  const [animationsAvailable, setAnimationsAvailable] = useState(false);

  const handleDefaultView = () => {
    window.player.updateCameraPosition("default");
  };

  const handleRightView = () => {
    window.player.updateCameraPosition("right");
  };

  const handleLeftView = () => {
    window.player.updateCameraPosition("left");
  };

  const handleTopView = () => {
    window.player.updateCameraPosition("top");
  };

  const handleScreenshot = () => {
    window.player.downloadScreenshot();
  };

  const handleDimensions = () => {
    window.player.setDimensionsVisible(!window.player.dimensionsVisible);
  };

  const handleZoomIn = () => {
    window.player.updateCameraPosition("zoom-in");
  };

  const icons = [
    {
      icon: defaultView,
      onClick: handleDefaultView,
      title: "Default View",
      classTitle: "default",
    },
    {
      icon: rightView,
      onClick: handleRightView,
      title: "Right View",
      classTitle: "right-view",
    },
    {
      icon: leftView,
      onClick: handleLeftView,
      title: "Left View",
      classTitle: "left-view",
    },
    {
      icon: topView,
      onClick: handleTopView,
      title: "Top View",
      classTitle: "top-view",
    },

    {
      icon: zoomIn,
      onClick: handleZoomIn,
      title: "Zoom In",
      classTitle: "zoom-in",
    },
    {
      icon: camera,
      onClick: handleScreenshot,
      title: "Download Screenshot",
      classTitle: "download-screenshot",
    },
    {
      icon: dimensions,
      onClick: handleDimensions,
      title: "Dimensions",
      classTitle: "dimensions",
    },
  ];

  const handleAnimationToggle = () => {
    window.player.playAnimation();
  };


  useEffect(() => {
    window.addEventListener('animationsAvailable', () => setAnimationsAvailable(true));
    window.addEventListener('animationsNotAvailable', () => setAnimationsAvailable(false));
  }, []);

  return (
    <div className='additional-options-closed'>
      <button
        className='additional-options-toggle'
        onClick={() => setIsOpenAdditionalOption(!isOpenAdditionalOption)}
      >
        <img src={additionalOptionsIcon} alt='Toggle options' />
      </button>
      {isOpenAdditionalOption && (
        <>
          {icons.map((item, index) => (
            <div key={index} className={`tooltip-container ${item.classTitle}`}>
              <Button
                icon={<img src={item.icon} alt={item.title} />}
                className='additional-options-buttons'
                onClick={item.onClick}
              />
              <span className='tooltip-text'>{item.title}</span>
            </div>
          ))}
        </>
      )}
      {animationsAvailable && (
        <Button
          icon={<img src={animationsIcon} alt='Animation' />}
          className='additional-options-buttons'
          onClick={handleAnimationToggle}
        />
      )}
    </div>
  );
};

export default AdditionalOptions;
