import { useEffect, useMemo, useState } from "react";

import BuildYourOwnModelSelectionMenu from "./MenuComponents/BuildYourOwnModelSelectionMenu";
import StaticFramesModelSelectionMenu from "./MenuComponents/StaticFramesModelSelectionMenu";
import UpholsteryMenu from "./MenuComponents/UpholsteryMenu";
import data from "./JolaPlayer/data.json";
import NailsMenu from "./MenuComponents/NailsMenu";
import ArmTypeMenu from "./MenuComponents/ArmTypeMenu";
import BackTypeMenu from "./MenuComponents/BackTypeMenu";
import BaseTypeMenu from "./MenuComponents/BaseTypeMenu";
import StaticFramesBaseTypeMenu from "./MenuComponents/StaticFramesBaseTypeMenu";
import StitchTypeMenu from "./MenuComponents/StitchTypeMenu";
import WeltOptionMenu from "./MenuComponents/WeltOptionMenu";
import FinishMenu from "./MenuComponents/FinishMenu";
import SeatCushionMenu from "./MenuComponents/SeatCushionMenu";

const LeftSidebarSelect = ({
  activeIcon,
  itemClicked,
  setItemClicked,
  isLeftSidebar,
  setActiveIcon,
  activePlayer,
  playerInstance,
  currentClassList,
  selectedOption,
  setSelectedOption,
  setCurrentClassList,
  modelWithNails,
  setModelWithNails,
  brandInstance,
  brandInstanceStaticFramesNumberOfBatches,
  brandInstanceOptions,
  brandInstanceConfiguratorTypes,
  brandInstanceConfiguratorType,
  setBrandInstanceConfiguratorType,
  brandInstanceConfiguratorTypeAdditionalOptions,
  modelUpholsteryFilter,
  setModelUpholsteryFilter,
  collection,
  handleAddParam,
  setStaticModelWithAnimation,
  playerRefCurrent,
  armNailOptions
}) => {
  const [fabrics, setFabrics] = useState(null);
  const [leathers, setLeathers] = useState(null);
  const [filteredModels, setFilteredModels] = useState(null);
  const [modelsData, setModelsData] = useState(null);
  const [finishes, setFinishes] = useState(null);

  const [avalableApplicationAreas, setAvailableApplicationAreas] =
    useState(null);

  const [iconOrder, setIconOrder] = useState([]);

  const [
    brandInstanceConfiguratorTypeAdditionalOptionsKeys,
    setBrandInstanceConfiguratorTypeAdditionalOptionsKeys,
  ] = useState(null);

  const optionNames = useMemo(() => {
    if (brandInstanceConfiguratorTypeAdditionalOptions) {
      setBrandInstanceConfiguratorTypeAdditionalOptionsKeys(
        Object.keys(brandInstanceConfiguratorTypeAdditionalOptions)
      );
    } else setBrandInstanceConfiguratorTypeAdditionalOptionsKeys([]);

  }, [brandInstanceConfiguratorTypeAdditionalOptions]);



  const [legSwitchAvailable, setlegSwitchAvailable] = useState(true);


  useEffect(() => {
    window.addEventListener('legSwitchAvailable', () => setlegSwitchAvailable(true));
    window.addEventListener('legSwitchNotAvailable', () => setlegSwitchAvailable(false));
  }, []);

  useEffect(() => {
    // TODO: FIX BASED ON NAILS CONFIG TYPES LENGTS AND ADDITIONAL OPTIONS
    if (brandInstanceConfiguratorTypes.length === 1) {
      modelWithNails
        ? setIconOrder([...["model", "upholstery", "finish", "nails"]])
        : setIconOrder([...["model", "upholstery", "finish"]]);
    } else {
      if (brandInstanceConfiguratorTypeAdditionalOptions) {
        modelWithNails
          ? setIconOrder([...["model", "upholstery", 'finish'], ...optionNames, "nails"])
          : setIconOrder([
            ...["model", "upholstery", 'finish'],
            ...brandInstanceConfiguratorTypeAdditionalOptionsKeys,
          ]);
      } else {
        modelWithNails
          ? setIconOrder([...["model", "upholstery", "finish", "nails"]])
          : setIconOrder([...["model", "upholstery", "finish"]]);
      }
    }
  }, [
    brandInstanceConfiguratorTypes,
    brandInstanceConfiguratorTypeAdditionalOptions,
    modelWithNails,
    brandInstanceConfiguratorTypeAdditionalOptionsKeys,
    optionNames,
  ]);

  useEffect(() => {
    if (collection) {
      if (collection.includes("Fabric")) {
        setModelUpholsteryFilter("fabric");
      } else if (collection.includes("Leather")) {
        setModelUpholsteryFilter("leather");
      }
    }
  }, [collection, setModelUpholsteryFilter]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLeathers(data.leathers);
        setFabrics(data.fabrics);
        setFinishes(data.finishes);
      } catch (error) {
        console.error("x", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const loadModelsData = async () => {
      try {
        const popularConfigurations = data.popularConfigurations;
        const frames = data.frames;

        if (
          brandInstanceConfiguratorType.name === "Build Your Own" ||
          brandInstanceConfiguratorType.name === "Sectionals"
        ) {
          let currentCollectionName = collection
            .split(" ")
            .join("-")
            .toLowerCase();

          let filteredPopularConfigurations = popularConfigurations.filter(
            (frame) =>
              frame.brandId === brandInstance.brandShorthand &&
              frame.collection === currentCollectionName
          );

          let filteredFrames = frames.filter(
            (frame) =>
              frame.collection === currentCollectionName && !frame.staticFrame
          );

          setModelsData([filteredPopularConfigurations, filteredFrames]);
        } else if (brandInstanceConfiguratorType.name === "Static Frames") {
          let filteredFrames = frames.filter(
            (frame) =>
              frame.brandId === brandInstance.brandShorthand &&
              frame.staticFrame
          );
          setModelsData(filteredFrames);
        }
      } catch (error) {
        console.error("Error loading models data:", error);
      }
    };

    if (activePlayer) {
      loadModelsData();
    }
  }, [activePlayer, collection, brandInstance, brandInstanceConfiguratorType]);

  useEffect(() => {
    if (modelsData && fabrics && leathers) {
      const data = {
        modelsData: modelsData,
        fabrics,
        leathers,
        finishes
      };

      setFilteredModels(data);
    }
  }, [modelsData, fabrics, leathers, brandInstanceConfiguratorType]);

  const handleOptionClick = (option) => {
    setSelectedOption(option);
  };

  const handleNextClick = () => {
    let currentIndex = iconOrder.indexOf(activeIcon);
    if (currentIndex >= 0 && currentIndex < iconOrder.length - 1) {
      let nextIcon = iconOrder[currentIndex + 1];

      setActiveIcon(nextIcon);
    }
  };

  const handleBackClick = () => {
    if (activeIcon === "upholstery") {
      window.player.updateCameraPosition();
    }
    let currentIndex = iconOrder.indexOf(activeIcon);

    if (currentIndex > 0) {
      let prevIcon = iconOrder[currentIndex - 1];
      setActiveIcon(prevIcon);
    }
  };

  if (filteredModels === null) {
    return <div>Loading...</div>;
  }

  return (
    <div
      className={`${isLeftSidebar ? "leftsidebar-select" : "bottomsidebar-select"
        }${!isLeftSidebar &&
          (activeIcon === "style-leg" ||
            activeIcon === "accessories" ||
            activeIcon === "nails")
          ? "bottomsidebar-select-center"
          : ""
        }`}
    >
      {activeIcon === "model" &&
        brandInstanceConfiguratorType.name === "Static Frames" && (
          <StaticFramesModelSelectionMenu
            activeIcon={activeIcon}
            handleOptionClick={handleOptionClick}
            data={filteredModels}
            itemClicked={itemClicked}
            setItemClicked={setItemClicked}
            isLeftSidebar={isLeftSidebar}
            currentClassList={currentClassList}
            setCurrentClassList={setCurrentClassList}
            playerInstance={playerInstance}
            selectedOption={selectedOption}
            setSelectedOption={setSelectedOption}
            modelWithNails={modelWithNails}
            setModelWithNails={setModelWithNails}
            brandInstanceStaticFramesNumberOfBatches={
              brandInstanceStaticFramesNumberOfBatches
            }
            brandInstanceOptions={brandInstanceOptions}
            brandInstanceConfiguratorType={brandInstanceConfiguratorType}
            brandInstanceConfiguratorTypes={brandInstanceConfiguratorTypes}
            setBrandInstanceConfiguratorType={setBrandInstanceConfiguratorType}
            modelUpholsteryFilter={modelUpholsteryFilter}
            setModelUpholsteryFilter={setModelUpholsteryFilter}
            collection={collection}
            handleAddParam={handleAddParam}
            setStaticModelWithAnimation={setStaticModelWithAnimation}
            playerRefCurrent={playerRefCurrent}
            setAvailableApplicationAreas={setAvailableApplicationAreas}
          />
        )}
      {activeIcon === "model" &&
        (brandInstanceConfiguratorType.name === "Build Your Own" ||
          brandInstanceConfiguratorType.name === "Sectionals") && (
          <BuildYourOwnModelSelectionMenu
            activeIcon={activeIcon}
            handleOptionClick={handleOptionClick}
            data={filteredModels}
            itemClicked={itemClicked}
            setItemClicked={setItemClicked}
            isLeftSidebar={isLeftSidebar}
            currentClassList={currentClassList}
            setCurrentClassList={setCurrentClassList}
            playerInstance={playerInstance}
            selectedOption={selectedOption}
            setSelectedOption={setSelectedOption}
            modelWithNails={modelWithNails}
            setModelWithNails={setModelWithNails}
            brandInstanceOptions={brandInstanceOptions}
            brandInstanceConfiguratorTypes={brandInstanceConfiguratorTypes}
            brandInstanceConfiguratorType={brandInstanceConfiguratorType}
            setBrandInstanceConfiguratorType={setBrandInstanceConfiguratorType}
            collection={collection}
            playerRefCurrent={playerRefCurrent}
          />
        )}

      {activeIcon === "upholstery" && (
        <UpholsteryMenu
          activeIcon={activeIcon}
          handleOptionClick={handleOptionClick}
          data={filteredModels}
          itemClicked={itemClicked}
          setItemClicked={setItemClicked}
          isLeftSidebar={isLeftSidebar}
          selectedOption={selectedOption}
          setSelectedOption={setSelectedOption}
          currentClassList={currentClassList}
          setCurrentClassList={setCurrentClassList}
          modelUpholsteryFilter={modelUpholsteryFilter}
          brandInstance={brandInstance}
          playerRefCurrent={playerRefCurrent}
          avalableApplicationAreas={avalableApplicationAreas}
        />
      )}
      {activeIcon === "finish" && (
        <FinishMenu
          activeIcon={activeIcon}
          handleOptionClick={handleOptionClick}
          data={finishes}
          itemClicked={itemClicked}
          setItemClicked={setItemClicked}
          isLeftSidebar={isLeftSidebar}
          selectedOption={selectedOption}
          setSelectedOption={setSelectedOption}
          currentClassList={currentClassList}
          setCurrentClassList={setCurrentClassList}
          modelUpholsteryFilter={modelUpholsteryFilter}
          brandInstance={brandInstance}
          playerRefCurrent={playerRefCurrent}
          avalableApplicationAreas={avalableApplicationAreas}
        />
      )}
      {activeIcon === "armTypes" && (
        <ArmTypeMenu
          activeIcon={activeIcon}
          handleOptionClick={handleOptionClick}
          armTypes={brandInstanceConfiguratorTypeAdditionalOptions["armTypes"]}
          playerInstance={playerInstance}
          itemClicked={itemClicked}
          setItemClicked={setItemClicked}
          isLeftSidebar={isLeftSidebar}
          currentClassList={currentClassList}
          setCurrentClassList={setCurrentClassList}
          selectedOption={selectedOption}
          setSelectedOption={setSelectedOption}
          brandInstanceConfiguratorTypeAdditionalOptions={
            brandInstanceConfiguratorTypeAdditionalOptions
          }
          playerRefCurrent={playerRefCurrent}
        />
      )}
      {activeIcon === "backTypes" && (
        <BackTypeMenu
          activeIcon={activeIcon}
          handleOptionClick={handleOptionClick}
          backTypes={
            brandInstanceConfiguratorTypeAdditionalOptions["backTypes"]
          }
          playerInstance={playerInstance}
          itemClicked={itemClicked}
          setItemClicked={setItemClicked}
          isLeftSidebar={isLeftSidebar}
          currentClassList={currentClassList}
          setCurrentClassList={setCurrentClassList}
          selectedOption={selectedOption}
          setSelectedOption={setSelectedOption}
          brandInstanceConfiguratorTypeAdditionalOptions={
            brandInstanceConfiguratorTypeAdditionalOptions
          }
          playerRefCurrent={playerRefCurrent}
        />
      )}
      {activeIcon === "seatCushionTypes" && (
        <SeatCushionMenu
          activeIcon={activeIcon}
          handleOptionClick={handleOptionClick}
          seatCushionTypes={
            brandInstanceConfiguratorTypeAdditionalOptions["seatCushionTypes"]
          }
          playerInstance={playerInstance}
          itemClicked={itemClicked}
          setItemClicked={setItemClicked}
          isLeftSidebar={isLeftSidebar}
          currentClassList={currentClassList}
          setCurrentClassList={setCurrentClassList}
          selectedOption={selectedOption}
          setSelectedOption={setSelectedOption}
          brandInstanceConfiguratorTypeAdditionalOptions={
            brandInstanceConfiguratorTypeAdditionalOptions
          }
          playerRefCurrent={playerRefCurrent}
        />
      )}
      {(activeIcon === "baseTypes" && brandInstanceConfiguratorType.name !== "Static Frames") && (
        <BaseTypeMenu
          activeIcon={activeIcon}
          handleOptionClick={handleOptionClick}
          baseTypes={
            brandInstanceConfiguratorTypeAdditionalOptions["baseTypes"]
          }
          playerInstance={playerInstance}
          itemClicked={itemClicked}
          setItemClicked={setItemClicked}
          isLeftSidebar={isLeftSidebar}
          currentClassList={currentClassList}
          setCurrentClassList={setCurrentClassList}
          selectedOption={selectedOption}
          setSelectedOption={setSelectedOption}
          brandInstanceConfiguratorTypeAdditionalOptions={
            brandInstanceConfiguratorTypeAdditionalOptions
          }
          playerRefCurrent={playerRefCurrent}
        />
      )}

      {(activeIcon === "baseTypes" && brandInstanceConfiguratorType.name === "Static Frames") && (
        <StaticFramesBaseTypeMenu
          activeIcon={activeIcon}
          handleOptionClick={handleOptionClick}
          baseTypes={
            []
          }
          playerInstance={playerInstance}
          itemClicked={itemClicked}
          setItemClicked={setItemClicked}
          isLeftSidebar={isLeftSidebar}
          currentClassList={currentClassList}
          setCurrentClassList={setCurrentClassList}
          selectedOption={selectedOption}
          setSelectedOption={setSelectedOption}
          brandInstanceConfiguratorTypeAdditionalOptions={
            brandInstanceConfiguratorTypeAdditionalOptions
          }
          playerRefCurrent={playerRefCurrent}
        />
      )}

      {activeIcon === "stitchTypes" && (
        <StitchTypeMenu
          activeIcon={activeIcon}
          handleOptionClick={handleOptionClick}
          stitchTypes={
            brandInstanceConfiguratorTypeAdditionalOptions["stitchTypes"]
          }
          playerInstance={playerInstance}
          itemClicked={itemClicked}
          setItemClicked={setItemClicked}
          isLeftSidebar={isLeftSidebar}
          currentClassList={currentClassList}
          setCurrentClassList={setCurrentClassList}
          selectedOption={selectedOption}
          setSelectedOption={setSelectedOption}
          brandInstanceConfiguratorTypeAdditionalOptions={
            brandInstanceConfiguratorTypeAdditionalOptions
          }
          playerRefCurrent={playerRefCurrent}
        />
      )}

      {activeIcon === "nails" && (
        <NailsMenu
          activeIcon={activeIcon}
          handleOptionClick={handleOptionClick}
          data={filteredModels}
          itemClicked={itemClicked}
          setItemClicked={setItemClicked}
          isLeftSidebar={isLeftSidebar}
          currentClassList={currentClassList}
          setCurrentClassList={setCurrentClassList}
          selectedOption={selectedOption}
          setSelectedOption={setSelectedOption}
          modelUpholsteryFilter={modelUpholsteryFilter}
          setModelUpholsteryFilter={setModelUpholsteryFilter}
          modelWithNails={modelWithNails}
          setModelWithNails={setModelWithNails}
          brandInstance={brandInstance}
          armNailOptions={armNailOptions}
        />
      )}
      {activeIcon === "weltOptions" && (
        <WeltOptionMenu
          itemClicked={itemClicked}
          setItemClicked={setItemClicked}
          isLeftSidebar={isLeftSidebar}
          currentClassList={currentClassList}
          setCurrentClassList={setCurrentClassList}
          playerInstance={playerInstance}
          selectedOption={selectedOption}
          setSelectedOption={setSelectedOption}
        />
      )}
      <div
        className={`${isLeftSidebar ? "back-next-buttons" : "display-none"}`}
      >
        {activeIcon !== iconOrder[0] && (
          <button onClick={handleBackClick} className='back-button'>
            BACK
          </button>
        )}

        {activeIcon !== iconOrder[iconOrder.length - 1] && (
          <button onClick={handleNextClick} className='next-button'>
            NEXT
          </button>
        )}
      </div>
    </div>
  );
};

export default LeftSidebarSelect;
