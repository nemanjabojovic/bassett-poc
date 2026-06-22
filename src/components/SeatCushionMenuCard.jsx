import { useEffect, useRef } from "react";
import JolaIcon from "../assets/icons/jolaLogo.svg";

const SeatCushionMenuCard = ({
  seatCushionTypes,
  itemClicked,
  setItemClicked,
  isLeftSidebar,
  selectedOption,
  setCurrentClassList,
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
  const handleSeatCushionTypeClick = async (seatCushionType, event, selectedOption) => {
    const classList = event.currentTarget.classList;
    setCurrentClassList(classList[1]);

    setItemClicked(seatCushionType);
    window.player.setSeatCushionType(seatCushionType);
  };

  return (
    <div
      className={
        isLeftSidebar
          ? `leftsidebar-submenu ${seatCushionTypes.length > 6 ? "" : "not-flex"}`
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
        {seatCushionTypes.map((seatCushionType, index) => (
          <div
            key={index}
            className={`leftsidebar-submenu-single-item ${selectedOption ? selectedOption : "item"
              } `}
            onClick={(e) =>
              handleSeatCushionTypeClick(seatCushionType, e, selectedOption)
            }
          >
            <img
              src={seatCushionType.icon}
              alt={seatCushionType.name}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = JolaIcon;
              }}
              className={`leftsidebar-submenu-single-item-img ${itemClicked?.name === seatCushionType.name
                ? `active-item ${selectedOption}`
                : ""
                } `}
            />
            <h3 className='leftsidebar-submenu-name'>{seatCushionType.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SeatCushionMenuCard;
