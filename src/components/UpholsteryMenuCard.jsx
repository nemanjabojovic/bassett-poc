import React, { useEffect, useRef, useState } from "react";
import JolaIcon from "../assets/icons/jolaLogo.svg";

const CLIENT_STATUSES = [
  // "Ready for Client 01",
  // "Working on Revisions 01",
  // "Ready for Client 02",
  // "Working on Revisions 02",
  // "Approved",
  // "Dropped",
  "Complete",
];

const UpholsteryMenuCard = ({
  items,
  itemClicked,
  setItemClicked,
  isLeftSidebar,
  selectedOption,
  setCurrentClassList,
  brandInstance,
  brandInstanceConfiguratorType,
  targetedApplicationArea,
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

  const handleItemsClick = async (finish, event, selectedOption) => {
    const classList = event.currentTarget.classList;
    setCurrentClassList(classList[1]);

    const selectedFinish = items.find((item) => item.name === finish.name);

    // if (itemClicked?.name === finish.name) {
    //   setItemClicked(null);
    //   await setTimeout(async () => await setItemClicked(selectedFinish), 0);
    //   setItemClicked(selectedFinish);
    // } else {
    await window.player.loadFabric(
      selectedFinish,
      targetedApplicationArea ? targetedApplicationArea : "PrimaryCover",
      true,
    );
    setItemClicked(selectedFinish);
    // }
  };

  const [availableItems, setAvailableItems] = useState(null);

  useEffect(() => {
    let filteredItems = items.filter(
      (x) => x.status && CLIENT_STATUSES.includes(x.status),
    );

    setAvailableItems(filteredItems);
  }, [items]);

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
        {availableItems &&
          availableItems.map((item, index) => (
            <div
              key={index}
              className={`leftsidebar-submenu-single-item ${
                selectedOption ? selectedOption : "item"
              } `}
              onClick={(e) => handleItemsClick(item, e, selectedOption)}
              data-id={item?.id}
            >
              <img
                src={brandInstanceConfiguratorType ? JolaIcon : item.icon}
                alt={item.name}
                loading='lazy'
                className={`leftsidebar-submenu-single-item-img ${
                  brandInstanceConfiguratorType
                    ? itemClicked?.name === item
                      ? `active-item ${selectedOption}`
                      : ""
                    : itemClicked?.name === item.name
                      ? `active-item ${selectedOption}`
                      : ""
                } `}
              />
              <h3 className='leftsidebar-submenu-name'>
                {brandInstanceConfiguratorType ? item : item.name}
                {brandInstanceConfiguratorType
                  ? ""
                  : item.sku
                    ? ` - ${item.sku}`
                    : ""}
              </h3>
            </div>
          ))}
      </div>
    </div>
  );
};

export default UpholsteryMenuCard;
