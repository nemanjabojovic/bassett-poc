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
  setAvailableApplicationAreas,
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

  useEffect(() => {
    if (selectedOption.includes("Batch")) {
      const selectedModel = items.find(
        (item) => item.sku === searchParamsModel
      );

      setModelUpholsteryFilter(
        selectedModel?.upholsteryFilter
          ? selectedModel?.upholsteryFilter
          : undefined
      );

      setModelWithNails(selectedModel?.nails || false);

      setAvailableApplicationAreas(selectedModel?.applicationAreas);
    }
  });

  // TODO: Possible fix
  const handleItemsClick = async (clickedItem, event, selectedOption) => {
    // if (selectedOption === "design" && !playerInstance.swap) return;

    const classList = event.currentTarget.classList;
    setCurrentClassList(classList[1]);
    const selectedModel = items.find((item) => item.sku === clickedItem.sku);

    if (itemClicked?.name === clickedItem.name) {
      setItemClicked(null);
      await setTimeout(async () => await setItemClicked(selectedModel), 0);
    } else {
      setItemClicked(selectedModel);
    }

    if (selectedOption.includes("Batch")) {
      if (selectedModel.legSwitch) {
        if (window.player.selectedBaseType && !selectedModel.legSwitch.some(leg => window.player.selectedBaseType.name === leg.name && window.player.selectedBaseType.sku === leg.sku)) {
          window.player.selectedBaseType = selectedModel.legSwitch[0];
        }
      }


      window.player.loadModel(selectedModel);
      setModelUpholsteryFilter(
        selectedModel?.upholsteryFilter
          ? selectedModel?.upholsteryFilter
          : undefined
      );

      setModelWithNails(
        items.find((x) => x.name === clickedItem.name)?.nails || false
      );

      setStaticModelWithAnimation(
        items.find((x) => x.name === clickedItem.name).animatedModel
          ? true
          : false
      );

      handleAddParam("model", selectedModel.sku);
      setAvailableApplicationAreas(selectedModel.applicationAreas);

      if (selectedModel.nails) {
        window.player.selectedNailOptionStandard =
          selectedModel.nails.defaultStandardNail;
        window.player.selectedNailOptionStandard2 =
          selectedModel.nails?.defaultStandardNail2;
        if (selectedModel.nails?.defaultNailFinish)
          await window.player.setNailColor(
            selectedModel.nails?.defaultNailFinish
          );
      }
    };
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
              src={config.icon}
              alt={config.name}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = JolaIcon;
              }}
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
