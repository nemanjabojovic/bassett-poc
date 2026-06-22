import { useEffect, useRef, useState } from "react";
import JolaIcon from "../assets/icons/jolaLogo.svg";

const WeltOptionMenuCard = ({
  itemClicked,
  setItemClicked,
  isLeftSidebar,
  selectedOption,
  setCurrentClassList,
  weltArea,
  weltOptions,
  filteredOptions
}) => {
  const containerRef = useRef(null);

  const [enabledOptions, setEnabledOptions] = useState(null);
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
    if (filteredOptions) {
      setEnabledOptions(weltOptions.filter(opt =>
        Object.keys(filteredOptions).some(key => key.includes(opt.name))
      ));

    }
  }, [filteredOptions]);

  // TODO: Possible fix
  const handleWeltOptionClick = async (weltOption, event, selectedOption) => {
    const classList = event.currentTarget.classList;
    setCurrentClassList(classList[1]);

    setItemClicked(weltOption);
    window.player.setWeltOption(weltOption,weltArea );
  };


  const optionsToRender = (enabledOptions && enabledOptions.length > 0)
    ? enabledOptions
    : weltOptions || [];

  return (
    <div
      className={
        isLeftSidebar
          ? `leftsidebar-submenu ${weltOptions.length > 6 ? "" : "not-flex"}`
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
        {optionsToRender.map((weltOption, index) => (
          <div
            key={index}
            className={`leftsidebar-submenu-single-item ${selectedOption ? selectedOption : "item"
              } `}
            onClick={(e) =>
              handleWeltOptionClick(weltOption, e, selectedOption)
            }
          >
            <img
              src={weltOption.icon || JolaIcon}
              alt={weltOption.name}
              className={`leftsidebar-submenu-single-item-img ${itemClicked?.name === weltOption.name
                ? `active-item ${selectedOption}`
                : ""
                } `}
            />
            <h3 className='leftsidebar-submenu-name'>{weltOption.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeltOptionMenuCard;
