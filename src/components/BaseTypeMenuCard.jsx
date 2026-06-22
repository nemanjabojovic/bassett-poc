import React, { useEffect, useRef } from "react";
import JolaIcon from "../assets/icons/jolaLogo.svg";

const BaseTypeMenuCard = ({
  baseTypes,
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
  const handleBaseTypeClick = async (baseType, event, selectedOption) => {
    const classList = event.currentTarget.classList;
    setCurrentClassList(classList[1]);

    setItemClicked(baseType);
    window.player.setBaseType(baseType);
  };

  return (
    <div
      className={
        isLeftSidebar
          ? `leftsidebar-submenu ${baseTypes.length > 6 ? "" : "not-flex"}`
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
        {baseTypes.map((baseType, index) => (
          <div
            key={index}
            className={`leftsidebar-submenu-single-item ${selectedOption ? selectedOption : "item"
              } `}
            onClick={(e) => handleBaseTypeClick(baseType, e, selectedOption)}
          >
            <img
              src={baseType.icon}
              alt={baseType.name}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = JolaIcon;
              }}
              className={`leftsidebar-submenu-single-item-img ${itemClicked?.name === baseType.name
                ? `active-item ${selectedOption}`
                : ""
                } `}
            />
            <h3 className='leftsidebar-submenu-name'>{baseType.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BaseTypeMenuCard;
