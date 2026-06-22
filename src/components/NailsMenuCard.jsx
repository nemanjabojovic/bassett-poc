import React, { useEffect, useRef } from "react";
import JolaIcon from "../assets/icons/jolaLogo.svg";

const MenuCard = ({
  items,
  itemClicked,
  setItemClicked,
  setActiveIcon,
  isLeftSidebar,
  selectedOption,
  setCurrentClassList,
  setModelWithNails,
  brandInstanceConfiguratorType,
  setModelUpholsteryFilter,
  searchParamsModel,
  handleAddParam,
  setStaticModelWithAnimation,
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

  const handleItemsClick = async (clickedItem, event, selectedOption) => {
    const classList = event.currentTarget.classList;
    setCurrentClassList(classList[1]);

    if (itemClicked?.name === clickedItem.name) {
      setItemClicked(null);
      await setTimeout(async () => await setItemClicked(clickedItem), 0);
    } else {
      setItemClicked(clickedItem);
      await window.player.setNailColor(clickedItem.id);
    }
  };

  return (
    <div
      className={
        isLeftSidebar
          ? `leftsidebar-submenu ${items.length > 6 ? "" : "not-flex"}`
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
        {items.map((config, index) => (
          <div
            key={index}
            className={`leftsidebar-submenu-single-item ${selectedOption ? selectedOption : "item"
              } `}
            onClick={(e) => handleItemsClick(config, e, selectedOption)}
            // onDragStart={(e) =>
            //   handleOnDragStart(config.name, e, selectedOption)
            // }
            // onDragEnd={handleOnDragEnd}
            // onTouchMove={(e) => handleOnTouchMove(config?.id, e)}
            // onTouchStart={(e) => handleOnTouchStart(config?.id, e)}
            // onTouchEnd={(e) => handleOnTouchEnd(config?.id, e)}
            // draggable={
            //   selectedOption === "popular" || selectedOption === "design"
            // }
            data-id={config?.id}
          >
            <img
              src={brandInstanceConfiguratorType ? JolaIcon : config.icon}
              alt={config.name}
              className={`leftsidebar-submenu-single-item-img ${brandInstanceConfiguratorType
                ? itemClicked?.name === config
                  ? `active-item ${selectedOption}`
                  : ""
                : itemClicked?.name === config.name
                  ? `active-item ${selectedOption}`
                  : ""
                } `}
            />
            <h3 className='leftsidebar-submenu-name'>
              {brandInstanceConfiguratorType
                ? ""
                : config.sku
                  ? `${config.sku} -`
                  : ""}

              {brandInstanceConfiguratorType ? config : config.name}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuCard;
