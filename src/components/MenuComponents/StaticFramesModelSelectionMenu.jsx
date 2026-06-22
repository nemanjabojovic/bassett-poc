import React, { useMemo, useState, useEffect } from "react";
import StaticFramesDropdownMenu from "../StaticFramesDropdownMenu";
import MenuCard from "../MenuCard";
import { useSearchParams } from "react-router-dom";

const StaticFramesModelSelectionMenu = ({
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
  brandInstanceStaticFramesNumberOfBatches,
  brandInstanceConfiguratorType,
  modelUpholsteryFilter,
  setModelUpholsteryFilter,
  handleAddParam,
  setStaticModelWithAnimation,
  playerRefCurrent,
  setAvailableApplicationAreas,
}) => {
  const [searchParams] = useSearchParams();


  const searchParamsModel = searchParams.get("model");

  const { modelsData } = data;
  const [filteredItems, setFilteredItems] = useState([]);

  const [selectedOption, setSelectedOption] = useState(`Batch 1`);

  const [modelBatchData, setModelBatchData] = useState([]);

  const names = useMemo(() => {
    return Array.from(
      { length: brandInstanceStaticFramesNumberOfBatches },
      (_, index) => `Batch ${index + 1}`
    );
  }, [brandInstanceStaticFramesNumberOfBatches]);

  useEffect(() => {
    if (/Batch\s(\d+)/.test(selectedOption)) {
      const match = selectedOption.match(/Batch\s(\d+)/);
      const batchNumber = parseInt(match[1], 10);
      setFilteredItems(
        modelsData.filter((modelData) => modelData.batchNumber === batchNumber)
      );

      setModelBatchData(
        modelsData.filter((modelData) => modelData.batchNumber === batchNumber)
      );
    }
  }, [selectedOption, modelsData, playerInstance]);

  const handleDropdownSelect = (selected) => {
    setFilteredItems(selected);
  };
  const handleDropdownInput = (selected) => {
    setFilteredItems(selected);
  };

  const handleBatchClick = (option) => {
    setSelectedOption(option);
  };

  const isActive = (option) => (selectedOption === option ? "active" : "");

  useEffect(() => {
    if (modelUpholsteryFilter === null) {
      if (playerInstance)
        if (searchParamsModel) {
          setSelectedOption(
            `Batch ${modelsData.find((item) => item.sku === searchParamsModel)
              .batchNumber
            }`
          );
          setAvailableApplicationAreas(modelsData.find((item) => item.sku === searchParamsModel)?.applicationAreas);

        } else {
          setModelUpholsteryFilter(modelsData[0].upholsteryFilter);
          setAvailableApplicationAreas(modelsData[0].applicationAreas);
        }
    }

  }, [
    modelsData,
    setModelUpholsteryFilter,
    modelUpholsteryFilter,
    playerInstance,
    searchParams,
    searchParamsModel,
    setAvailableApplicationAreas,
  ]);

  return (
    <section
      className={isLeftSidebar ? "leftside-bar-menu" : "bottomside-bar-menu"}
    >
      <div className='content-wrapper'>
        <h1 className={!isLeftSidebar ? "display-none" : null}>Select Model</h1>
        <p>
          Selected Model:{" "}
          <span>
            {itemClicked
              ? itemClicked.name
              : searchParamsModel
                ? modelsData.find((model) => model.id === searchParamsModel).name
                : modelsData[0].name}
          </span>
        </p>
        <div className={`${isLeftSidebar ? "column" : "reverse-column"}`}>
          <div className='leftsidebar-input'>
            <StaticFramesDropdownMenu
              activeIcon={activeIcon}
              items={modelBatchData}
              onSelect={handleDropdownSelect}
              onInput={handleDropdownInput}
              setSelectedOption={setSelectedOption}
              isLeftSidebar={isLeftSidebar}
            />
          </div>
          <div
            className={`leftsidebar-pick ${!isLeftSidebar ? "bottomsidebar-pick" : ""
              }`}
            style={{ justifyContent: !isLeftSidebar ? "center" : "start" }}
          >
            {names.map((name, index) => (
              <h1
                key={`Batch ${index + 1}`}
                onClick={() => handleBatchClick(name)}
                className={isActive(name)}
              >
                {name}
              </h1>
            ))}
          </div>
        </div>
        <MenuCard
          items={filteredItems}
          itemClicked={itemClicked}
          setItemClicked={setItemClicked}
          isLeftSidebar={isLeftSidebar}
          selectedOption={selectedOption}
          currentClassList={currentClassList}
          setCurrentClassList={setCurrentClassList}
          playerInstance={playerInstance}
          modelWithNails={modelWithNails}
          setModelWithNails={setModelWithNails}
          modelUpholsteryFilter={modelUpholsteryFilter}
          setModelUpholsteryFilter={setModelUpholsteryFilter}
          searchParamsModel={searchParamsModel}
          handleAddParam={handleAddParam}
          setStaticModelWithAnimation={setStaticModelWithAnimation}
          playerRefCurrent={playerRefCurrent}
          setAvailableApplicationAreas={setAvailableApplicationAreas}
        />
      </div>
    </section>
  );
};

export default StaticFramesModelSelectionMenu;
