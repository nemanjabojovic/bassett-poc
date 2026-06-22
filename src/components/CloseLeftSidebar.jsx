import React from "react";

const CloseLeftSidebar = ({ activeIcon, isLeftSidebar }) => {
  const getTitle = () => {
    switch (activeIcon) {
      case "configuratorTypes":
        return "Select Configurator Type";
      case "model":
        return "Select Model";
      case "upholstery":
        return "Select Upholstery";
      case "style-leg":
        return "Select Style-Leg";
      case "armTypes":
        return "Select Arm Type";
      case "backTypes":
        return "Select Back Type";
      case "baseTypes":
        return "Select Back Type";
      case "accessories":
        return "Select Accessories";
      case "nails":
        return "Select Nail Options";
      case "weltOptions":
        return "Select Welt Option";
      case "finish":
        return "Select Finish";
      default:
        return "Select Item";
    }
  };

  return (
    <div className={isLeftSidebar ? "close-leftside-bar" : "display-none"}>
      <h1>{getTitle()}</h1>
    </div>
  );
};

export default CloseLeftSidebar;
