import React, { useEffect, useRef } from "react";
import JolaIcon from "../assets/icons/jolaLogo.svg";

const BackTypeMenuCard = ({
  backTypes,
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
  const handleBackTypeClick = async (backType, event, selectedOption) => {
    const classList = event.currentTarget.classList;
    setCurrentClassList(classList[1]);

    setItemClicked(backType);

    window.player.setBackType(backType);
  };

  return (
    <div
      className={
        isLeftSidebar
          ? `leftsidebar-submenu ${backTypes.length > 6 ? "" : "not-flex"}`
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
        {backTypes.map((backType, index) => (
          <div
            key={index}
            className={`leftsidebar-submenu-single-item ${selectedOption ? selectedOption : "item"
              } `}
            onClick={(e) => handleBackTypeClick(backType, e, selectedOption)}
          >
            <img
              src={backType.icon}
              alt={backType.name}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = JolaIcon;
              }}
              className={`leftsidebar-submenu-single-item-img ${itemClicked?.name === backType.name
                ? `active-item ${selectedOption}`
                : ""
                } `}
            />
            <h3 className='leftsidebar-submenu-name'>{backType.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BackTypeMenuCard;
