import React, { useEffect, useRef, useState } from "react";
import searchIcon from "../assets/icons/searchIcon.svg";

const DropdownMenu = ({
  items,
  onSelect,
  setSelectedOption,
  activeIcon,
  isLeftSidebar,
}) => {
  const [isInputActive, setIsInputActive] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isInputActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isInputActive]);

  const handleInputActive = () => {
    // On icon click, sets dropdown to "all"


    setIsInputActive(!isInputActive);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleInput = (e) => {
    const inputItemsFilter = e.target.value.toLowerCase();

    const selected = items.filter((item) => {
      const combined = `${item.sku} ${item.name}`.toLowerCase();
      const regex = new RegExp(
        inputItemsFilter
          .split("" || " ")
          .map((char) => `.*${char}`)
          .join(""),
        "i",
      );
      return regex.test(combined);
    });

    onSelect(selected);
  };

  return (
    <div
      className={
        isLeftSidebar ? "leftsidebar-dropdown" : "bottomsidebar-dropdown"
      }
    >
      <div className='leftsidebar-input'>
        <img src={searchIcon} alt='search' onClick={handleInputActive} />
        <input
          type='text'
          ref={inputRef}
          onChange={handleInput}
          onInput={handleInput}
        />
      </div>
      {/* <div className="dropdown-menu">
        <label className="dropdown-label" htmlFor="dropdown">
          Display:
        </label>
        <select
          className="dropdown-select"
          id="dropdown"
          value={selectedFilter}
          onChange={handleSelect}
        >
          {activeIcon === "model" && (
            <>
              <option value="All">All</option>
              <option value="corner">Corner</option>
              <option value="armless">Armless</option>
              <option value="right-arm">Right arm</option>
              <option value="left-arm">Left arm</option>
            </>
          )}

          {activeIcon === "upholstery" && (
            <>
              <option value="All">All</option>
              <option value="Black">Black</option>
              <option value="Gray">Gray</option>
              <option value="Orange">Orange</option>
              <option value="Blue">Blue</option>
            </>
          )}
        </select>
      </div> */}
    </div>
  );
};

export default DropdownMenu;
