import { useEffect, useState, useRef } from "react";
import DeleteEditOption from "../components/DeleteEditOption";
import AdditionalOptions from "../components/AdditionalOptions";
import LeftSidebar from "../components/LeftSidebar";
import { useSearchParams } from "react-router-dom";
import data from "../components/JolaPlayer/data.json";

import Slider from "@mui/material/Slider";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Summary from "../components/Summary";
import { styled } from "@mui/material";
import JolaPlayer from "../components/JolaPlayer";
import { resolveModelOptions } from "../components/JolaPlayer/utils";
const Player = ({
  itemClicked,
  setItemClicked,
  isLeftSidebar,
  showOrientationOptions,
  toggleOrientationOptions,
  setIsLeftSidebar,
  playerInstance,
  isOpenAdditionalOption,
  setIsOpenAdditionalOption,
  activePlayer,
  setPlayerInstance,
  modelPath,
  setCurrentClassList,
  currentClassList,
  brandInstance,
  brandInstanceConfiguratorType,
  setBrandInstanceConfiguratorType,
  collection,
  setCollection,
  setSearchParams,
  setSearchParamsModel,
  handleAddParam,
  additionalOptionsCollectionFilter,
  setStaticModelWithAnimation,
  staticModelWithAnimation,
}) => {
  const modalRef = useRef(null);
  const playerRef = useRef();

  const [skuToLoad, setSkuToLoad] = useState(null);
  const [playerOptions, setPlayerOptions] = useState(null);

  const [configurationToLoad, setConfigurationToLoad] = useState(null);

  const [searchParams] = useSearchParams();
  const [sliderValue, setSliderValue] = useState(0);

  const [selectedOption, setSelectedOption] = useState(
    brandInstance.configuratorTypes.length > 1 ? "Batch 1" : "popular",
  );

  const handleResetAngle = () => {
    playerRef.current.resetLightsSlider();
    setSliderValue(0);
  };

  const handleAngleChange = (_, newValue) => {
    const angleValue = Number(newValue || 0);

    playerRef.current.changeLightsSlider(angleValue);

    setSliderValue(angleValue);
  };
  const [showSummary, setShowSummary] = useState(false);
  // const [canCloseSummary, setCanCloseSummary] = useState(true);

  const ResetButton = styled(Button)({
    color: "#F07F26",
    border: "1px solid #F07F26",
  });

  //TODO: forward collection to player
  useEffect(() => {
    const paramsObject = {};
    for (const [key, value] of searchParams.entries()) {
      paramsObject[key] = value;
    }

    let sku;
    if (paramsObject.collection) {
      let formatedCollection = paramsObject.collection
        .split(" ")
        .join("-")
        .toLowerCase();

      let firstCollectionArm = data.collectionOptions.armTypes.find(
        (armType) => armType.collection === formatedCollection,
      );
      let firstCollectionPopularConfiguration = data.popularConfigurations.find(
        (configuration) => configuration.collection === formatedCollection,
      );

      if (firstCollectionArm) {
        sku = `${firstCollectionArm.sku}-${firstCollectionPopularConfiguration.elements[0].id}`;
      } else {
        sku = `${firstCollectionPopularConfiguration.elements[0].id}`;
      }
      setConfigurationToLoad(firstCollectionPopularConfiguration);
      setSkuToLoad(sku);
    } else if (paramsObject.model) {
      setSkuToLoad(paramsObject.model);
    } else {
      let frame = data.frames.find(
        (frame) => frame.brandId === paramsObject.brand,
      );
      setSkuToLoad(frame.sku);
    }
  }, [collection, brandInstance, searchParams]);

  //-----
  useEffect(() => {
    if (!skuToLoad) return;

    const options = resolveModelOptions(skuToLoad);

    if (options) {
      options.containerId = "player";
      options.loadingScreenId = "loading-screen";

      if (options?.frame?.nails) {
        options.nailOptions = {
          nailsColor: options.frame.nails.defaultNailFinish,
          nailOptionStandard: options.frame.nails.defaultStandardNail,
          nailOptionStandard2: options.frame.nails.defaultStandardNail2,
        };
      }

      switch (options.brand.id) {
        case "HF":
          options.fabric = [
            {
              texture: data.fabrics.find(
                (fabric) => fabric.name === "400569-04",
              ),
              name: "PrimaryCover",
            },
          ];
          break;
        case "BY":
          options.fabric = [
            {
              texture: data.leathers.find(
                (leather) => leather.name === "922000-82",
              ),
              name: "PrimaryCover",
            },
          ];
          break;
        case "SSW":
          options.fabric = [
            {
              texture: data.fabrics.find(
                (fabric) => fabric.name === "SW5404-0000",
              ),
              name: "PrimaryCover",
            },
          ];
          break;
        default:
          options.fabric = [
            {
              texture: data.fabrics[0],
              name: "PrimaryCover",
            },
          ];
          break;
      }

      // do something with playerOptions here, e.g.:
      // playerRef.current.init(playerOptions);
      // or setPlayerOptions(playerOptions);
      options.popularConfiguration = configurationToLoad;
      options.data = data;

      options.setSwapInitiated = () => {
        // Left this as a test example of swap callback
        console.log("Swap initiated");
      };

      options.setSwapCompleted = () => {
        // Left this as a test example of swap callback
        console.log("Swap completed");
      };

      setPlayerOptions(options);
    }
  }, [skuToLoad, configurationToLoad]);

  return (
    <section
      className={`home-hero ${isLeftSidebar ? "flex-row" : "flex-colivimn"}`}
    >
      {showSummary && (
        <div ref={modalRef}>
          <Summary setShowSummary={setShowSummary} />
        </div>
      )}

      <LeftSidebar
        itemClicked={itemClicked}
        setItemClicked={setItemClicked}
        isLeftSidebar={isLeftSidebar}
        activePlayer={activePlayer}
        playerInstance={playerInstance}
        currentClassList={currentClassList}
        setCurrentClassList={setCurrentClassList}
        selectedOption={selectedOption}
        setSelectedOption={setSelectedOption}
        setPlayerInstance={setPlayerInstance}
        brandInstance={brandInstance}
        brandInstanceOptions={brandInstance}
        brandInstanceStaticFramesNumberOfBatches={
          brandInstance["configuratorTypes"][0]["numberOfBatches"]
        }
        brandInstanceConfiguratorTypes={brandInstance.configuratorTypes}
        brandInstanceConfiguratorType={brandInstanceConfiguratorType}
        setBrandInstanceConfiguratorType={setBrandInstanceConfiguratorType}
        collection={collection}
        setCollection={setCollection}
        setSearchParamsModel={setSearchParamsModel}
        setSearchParams={setSearchParams}
        handleAddParam={handleAddParam}
        additionalOptionsCollectionFilter={additionalOptionsCollectionFilter}
        setStaticModelWithAnimation={setStaticModelWithAnimation}
        playerRefCurrent={playerRef.current}
      />

      <div className='model-section'>
        <div id='loading-screen' className='flex-column'>
          <div aria-busy='true' id='loading-screen-img'>
            <div className='loader-container'>
              <div className='container'>
                <div className='composition'>
                  <div className='dot-orbit orbit'>
                    <div className='full dot'></div>
                    <div className='ring'></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {brandInstanceConfiguratorType.name !== "Static Frames" && (
          <DeleteEditOption
            itemClicked={itemClicked}
            setItemClicked={setItemClicked}
            isLeftSidebar={isLeftSidebar}
            showOrientationOptions={showOrientationOptions}
            toggleOrientationOptions={toggleOrientationOptions}
            setIsLeftSidebar={setIsLeftSidebar}
            player={playerInstance}
            selectedOption={selectedOption}
            setSelectedOption={setSelectedOption}
            playerRefCurrent={playerRef.current}
          />
        )}

        <AdditionalOptions
          itemClicked={itemClicked}
          isOpenAdditionalOption={isOpenAdditionalOption}
          setIsOpenAdditionalOption={setIsOpenAdditionalOption}
          player={playerInstance}
          staticModelWithAnimation={staticModelWithAnimation}
          playerRef={playerRef}
        />

        {playerOptions && (
          <JolaPlayer ref={playerRef} options={playerOptions}></JolaPlayer>
        )}

        <div className='light-angle-slider-container'>
          <Typography sx={{ userSelect: "none" }} variant='h6'>
            Light Angle
          </Typography>

          <Slider
            size='small'
            sx={{ width: 150, color: "#F07F26" }}
            aria-label='light-angle-slider'
            value={sliderValue}
            valueLabelDisplay='auto'
            onChange={handleAngleChange}
            min={0}
            max={360}
          />

          <ResetButton onClick={handleResetAngle}>Reset Angle</ResetButton>
        </div>
      </div>
    </section>
  );
};

export default Player;
