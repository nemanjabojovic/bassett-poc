import React, { useState, useEffect } from "react";
import BuildYourOwnDropdownMenu from "../BuildYourOwnDropdownMenu";
import BuildYourOwnMenuCard from "../BuildYourOwnMenuCard";

const BuildYourOwnModelSelectionMenu = ({
  data,
  activeIcon,
  itemClicked,
  setItemClicked,
  isLeftSidebar,
  currentClassList,
  setCurrentClassList,
  playerInstance,
  modelWithNails,
  setModelWithNails,
  brandInstanceConfiguratorType,
  collection,
  playerRefCurrent,
}) => {
  const { modelsData } = data;
  const [filteredItems, setFilteredItems] = useState([]);

  const [selectedOption, setSelectedOption] = useState("popular");

  useEffect(() => {
    // Show models when "Design Your Own" is selected
    if (selectedOption === "design") {
      setFilteredItems(modelsData[1]);
      window.player.setEditSelected(true);



    } else if (selectedOption === "popular") {
      setFilteredItems(modelsData[0]);
    }
  }, [selectedOption, modelsData, playerInstance]);

  const handleDropdownSelect = (selected) => {
    setFilteredItems(selected);
  };
  const handleInputSelect = (selected) => {
    setFilteredItems(selected);
  };

  const handleModelClick = (option) => {
    const lowerOption = option.toLowerCase();

    setSelectedOption(lowerOption);
  };

  const isActive = (option) => (selectedOption === option ? "active" : "");

  return (
    <section
      className={isLeftSidebar ? "leftside-bar-menu" : "bottomside-bar-menu"}
    >
      <div className='content-wrapper'>
        <h1 className={!isLeftSidebar ? "display-none" : null}>Select Model</h1>
        <div className={`${isLeftSidebar ? "column" : "reverse-column"}`}>
          <div className='leftsidebar-input'>
            <BuildYourOwnDropdownMenu
              activeIcon={activeIcon}
              items={
                selectedOption === "popular" ? modelsData[0] : modelsData[1]
              }
              onSelect={handleDropdownSelect}
              onInput={handleInputSelect}
              selectedOption={selectedOption}
              setSelectedOption={setSelectedOption}
              isLeftSidebar={isLeftSidebar}
            />
          </div>
          <div
            className={`leftsidebar-pick ${!isLeftSidebar ? "bottomsidebar-pick" : ""
              }`}
            style={{ justifyContent: !isLeftSidebar ? "center" : "start" }}
          >
            <h1
              onClick={() => handleModelClick("popular")}
              className={isActive("popular")}
            >
              Popular Configurations
            </h1>
            <h1
              onClick={() => handleModelClick("design")}
              className={isActive("design")}
            >
              Design Your Own
            </h1>
          </div>
        </div>

        {filteredItems && (
          <BuildYourOwnMenuCard
            items={filteredItems}
            itemClicked={itemClicked}
            setItemClicked={setItemClicked}
            isLeftSidebar={isLeftSidebar}
            selectedOption={selectedOption}
            setSelectedOption={setSelectedOption}
            currentClassList={currentClassList}
            setCurrentClassList={setCurrentClassList}
            brandInstanceConfiguratorType={brandInstanceConfiguratorType}
            playerInstance={playerInstance}
            modelWithNails={modelWithNails}
            setModelWithNails={setModelWithNails}
            playerRefCurrent={playerRefCurrent}
          />
        )}
      </div>
    </section>
  );
};

export default BuildYourOwnModelSelectionMenu;
