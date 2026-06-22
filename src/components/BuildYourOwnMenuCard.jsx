import React, { useEffect, useRef, useState } from "react";
import JolaIcon from "../assets/icons/jolaLogo.svg";

const BuildYourOwnMenuCard = ({
  items,
  itemClicked,
  playerInstance,
  setItemClicked,
  setActiveIcon,
  isLeftSidebar,
  selectedOption,
  setSelectedOption,
  setCurrentClassList,
  setModelWithNails,
  brandInstanceConfiguratorType,
  setModelUpholsteryFilter,
  playerRefCurrent,
}) => {
  const containerRef = useRef(null);

  const [filteredItems, setFilteredItems] = useState(items);

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

  const handleItemsClick = async (name, event, selectedOption) => {
    if (selectedOption !== "design") {
      const classList = event.currentTarget.classList;
      setCurrentClassList(classList[1]);

      const selectedModel = items.find((item) => item.name === name);

      if (itemClicked?.name === name) {
        setItemClicked(null);
        await setTimeout(async () => await setItemClicked(selectedModel), 0);
      } else {
        setItemClicked(selectedModel);
      }

      if (selectedOption === "design") {
        window.player.addConfiguration({ id: selectedModel.id, temp: true });
        window.player.setEditSelected(true);
      } else if (selectedOption === "popular") {
        window.player.setConfiguration(selectedModel);
        window.player.setEditSelected(false);
      }
    } else {
      const selectedModel = items.find((item) => item.name === name);

      if (window.player.swap) window.player.setSwapElement(selectedModel);
    }
  };

  const handleOnDragStart = (name, event, selectedOption) => {
    event.preventDefault(); // Prevents default drag behavior
    if (selectedOption === "design") {
      const classList = event.currentTarget.classList;
      setCurrentClassList(classList[1]);

      const selectedModel = items.find((item) => item.name === name);
      setItemClicked(selectedModel);

      if (selectedModel && window.player) {
        window.player.onDragStart(selectedModel.id);
      }
    }
  };

  const handleOnDragEnd = () => {
    if (window.player) {
      window.player.onDragEnd();
    }
  };

  const enableEditMode = () => {
    window.player.editSelected = true;

    setSelectedOption("design");
  };

  const startNewBuild = () => {
    window.player.clearConfiguration();
    setSelectedOption("design");
    window.player.editSelected = true;
  };

  useEffect(() => {
    if (
      items.some((item) => item.availableArmSkus) &&
      window?.player.selectedArmType
    ) {
      setFilteredItems(
        items.filter((item) =>
          item?.availableArmSkus.includes(window.player.selectedArmType.sku),
        ),
      );
    } else setFilteredItems(items);
  }, [items, setFilteredItems]);

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
        className={`${
          isLeftSidebar
            ? "leftsidebar-submenu-items"
            : "bottomsidebar-submenu-items"
        }`}
      >
        {selectedOption === "popular" && (
          <div
            key={"new-build"}
            className={"leftsidebar-submenu-single-item popular "}
            draggable={false}
            onClick={() => {
              startNewBuild();
            }}
          >
            <div>
              <img src={JolaIcon} alt='icon' />
            </div>
            <h3 className={"leftsidebar-submenu-name"}>start new build</h3>
          </div>
        )}
        {filteredItems.map((config, index) => (
          <div key={`popular-builds-${index}`}>
            <div
              key={index}
              className={`leftsidebar-submenu-single-item ${
                selectedOption ? selectedOption : "item"
              } `}
              onClick={(e) => handleItemsClick(config.name, e, selectedOption)}
              onDragStart={(e) =>
                handleOnDragStart(config.name, e, selectedOption)
              }
              onDragEnd={handleOnDragEnd}
              draggable={
                selectedOption === "popular" || selectedOption === "design"
              }
              data-id={config?.id}
            >
              <img
                loading='lazy'
                src={config.icon}
                alt={config.name}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = JolaIcon;
                }}
                className={`leftsidebar-submenu-single-item-img ${
                  brandInstanceConfiguratorType
                    ? itemClicked?.name === config
                      ? `active-item ${selectedOption}`
                      : ""
                    : itemClicked?.name === config.name
                      ? `active-item ${selectedOption}`
                      : ""
                } `}
              />
              <h3 className='leftsidebar-submenu-name'>
                {config.name}
                {config.sku ? ` - ${config.sku}` : ""}
              </h3>
            </div>
            {selectedOption === "popular" && (
              <div
                key={"edit-current"}
                className={"edit-configuration"}
                onClick={() => enableEditMode()}
              >
                EDIT
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BuildYourOwnMenuCard;
