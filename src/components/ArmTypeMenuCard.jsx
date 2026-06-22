import React, { useEffect, useRef } from "react";
import JolaIcon from "../assets/icons/jolaLogo.svg";

const ArmTypeMenuCard = ({
  armTypes,
  itemClicked,
  setItemClicked,
  isLeftSidebar,
  selectedOption,
  setCurrentClassList,
  playerInstance,
  playerRefCurrent,
}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!isLeftSidebar && container) {
      const handleScroll = (e) => {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      };

      container.addEventListener("wheel", handleScroll);

      return () => container.removeEventListener("wheel", handleScroll);
    }
  }, [isLeftSidebar]);

  // TODO: Possible fix
  const handleArmTypeClick = async (armType, event, selectedOption) => {
    const classList = event.currentTarget.classList;
    setCurrentClassList(classList[1]);

    setItemClicked(armType);
    if (armType.nails) {
      window.dispatchEvent(new Event("nailsAvailable"));
    } else {
      window.dispatchEvent(new Event("nailsNotAvailable"));
    }


    window.player.setArmType(armType);
  };

  return (
    <div
      className={
        isLeftSidebar
          ? `leftsidebar-submenu ${armTypes.length > 6 ? "" : "not-flex"}`
          : "bottomside-submenu"
      }
      ref={containerRef}
    >
      <div
        className={`${isLeftSidebar
          ? "leftsidebar-submenu-items"
          : "bottomsidebar-submenu-items"
          }`}
      >
        {armTypes.map((armType, index) => (
          <div
            key={index}
            className={`leftsidebar-submenu-single-item ${selectedOption ? selectedOption : "item"
              } `}
            onClick={(e) => handleArmTypeClick(armType, e, selectedOption)}
          >
            <img
              src={armType.icon}
              alt={armType.name}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = JolaIcon;
              }}
              className={`leftsidebar-submenu-single-item-img ${itemClicked?.name === armType.name
                ? `active-item ${selectedOption}`
                : ""
                } `}
            />
            <h3 className='leftsidebar-submenu-name'>{armType.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArmTypeMenuCard;
