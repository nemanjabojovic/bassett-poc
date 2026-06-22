import React, { useEffect, useRef } from "react";
import JolaIcon from "../assets/icons/jolaLogo.svg";

const ConfiguratorTypeMenuCard = ({
  items,
  itemClicked,
  setItemClicked,
  setActiveIcon,
  isLeftSidebar,
  selectedOption,
  setCurrentClassList,
  setModelWithNails,
  brandInstanceConfiguratorType,
  selectBrandInstanceConfiguratorType,
  setModelUpholsteryFilter,
  collection,
  setCollection,
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
  const handleCollectionClick = async (collection, event, selectedOption) => {
    const classList = event.currentTarget.classList;
    setCurrentClassList(classList[1]);

    setActiveIcon("model");

    let collectionFiltered = collection.split(" ").join("-").toLowerCase();

    setCollection(collection);

    window.player.staticFramesConfigurator = false;
    window.player.collection = collectionFiltered;
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
        {items.map((collection, index) => (
          <div
            key={index}
            className={`leftsidebar-submenu-single-item ${selectedOption ? selectedOption : "item"
              } `}
            onClick={(e) =>
              handleCollectionClick(collection, e, selectedOption)
            }
          >
            <img
              src={JolaIcon}
              alt={index}
              className={`leftsidebar-submenu-single-item-img ${itemClicked?.name === collection
                ? `active-item ${selectedOption}`
                : ""
                } `}
            />
            <h3 className='leftsidebar-submenu-name'>{collection}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConfiguratorTypeMenuCard;
