import React, { useEffect, useRef, useState } from "react";
import JolaIcon from "../assets/icons/jolaLogo.svg";

const CLIENT_STATUSES = [
  "Ready for Client 01",
  "Working on Revisions 01",
  "Ready for Client 02",
  "Working on Revisions 02",
  "Approved",
  "Dropped",
  "Complete",
];

const FinishMenuCard = ({
  items,
  itemClicked,
  setItemClicked,
  isLeftSidebar,
  setCurrentClassList,
  brandInstanceConfiguratorType,
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

  const handleItemsClick = async (finish, event) => {
    const classList = event.currentTarget.classList;
    setCurrentClassList(classList[1]);
    const selectedFinish = items.find((item) => item.sku === finish.sku);
    await window.player.loadFinish(
      selectedFinish
    );
    setItemClicked(selectedFinish);
  };


  const [availableItems, setAvailableItems] = useState(null);

  useEffect(() => {
    // FILTERING DISABLED
    // let filteredItems = items.filter(x => x.status && CLIENT_STATUSES.includes(x.status));
    // setAvailableItems(filteredItems);

    setAvailableItems(items);

  }, [
    items
  ]);



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
        {availableItems && availableItems.map((item, index) => (


          <div
            key={index}
            className={`leftsidebar-submenu-single-item`}
            onClick={(e) => handleItemsClick(item, e)}
            data-id={item?.id}
          >
            <img
              src={item.icon}
              alt={item.name}
              loading="lazy"
              className={`leftsidebar-submenu-single-item-img `}
              onError={(e) => {
                e.currentTarget.src = JolaIcon; // fallback image
              }}
            />
            <h3 className='leftsidebar-submenu-name'>
              {item.name}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FinishMenuCard;
