import { useEffect, useRef } from "react";

const StitchTypeMenuCard = ({
  stitchTypes,
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
  const handleStitchTypeClick = async (stitchType, event, selectedOption) => {
    const classList = event.currentTarget.classList;
    setCurrentClassList(classList[1]);

    setItemClicked(stitchType);
    window.player.setStitchType(stitchType);
  };

  return (
    <div
      className={
        isLeftSidebar
          ? `leftsidebar-submenu ${stitchTypes.length > 6 ? "" : "not-flex"}`
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
        {stitchTypes.map((stitchType, index) => (
          <div
            key={index}
            className={`leftsidebar-submenu-single-item ${selectedOption ? selectedOption : "item"
              } `}
            onClick={(e) =>
              handleStitchTypeClick(stitchType, e, selectedOption)
            }
          >
            <img
              src={stitchType.icon}
              alt={stitchType.name}
              className={`leftsidebar-submenu-single-item-img ${itemClicked?.name === stitchType.name
                ? `active-item ${selectedOption}`
                : ""
                } `}
            />
            <h3 className='leftsidebar-submenu-name'>{stitchType.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StitchTypeMenuCard;
