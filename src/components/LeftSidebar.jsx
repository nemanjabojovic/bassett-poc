import React, { useEffect, useState } from "react";
import LeftSidebarSelect from "./LeftSidebarSelect";
import CloseLeftSidebar from "./CloseLeftSidebar";
import buttonClose from "../assets/icons/collapseButtonClose.svg";
import buttonOpen from "../assets/icons/collapseButtonOpen.svg";
import backButtonImage from "../assets/icons/arrow-back.png";
import armStyleImage from "../assets/icons/armStyle.png";
import backStyleImage from "../assets/icons/backStyle.png";
import baseStyleImage from "../assets/icons/legStyle.png";

import { ReactComponent as ModelIcon } from "../assets/icons/modelIcon.svg";
import { ReactComponent as UpholsteryIcon } from "../assets/icons/upholsteryIcon.svg";
import { ReactComponent as NailsIcon } from "../assets/icons/nailsIcon.svg";
import { ReactComponent as WeltIcon } from "../assets/icons/weltOptionIcon.svg";
import { ReactComponent as FinishIcon } from "../assets/icons/finishIcon.svg";
import { ReactComponent as SeatCushionIcon } from "../assets/icons/seatCushionStyleImage.svg";

const LeftSidebar = ({
  itemClicked,
  setItemClicked,
  isLeftSidebar,
  activePlayer,
  playerInstance,
  setCurrentClassList,
  currentClassList,
  selectedOption,
  setSelectedOption,
  brandInstance,
  brandInstanceStaticFramesNumberOfBatches,
  brandInstanceOptions,
  brandInstanceConfiguratorType,
  brandInstanceConfiguratorTypes,
  setBrandInstanceConfiguratorType,
  collection,
  setCollection,
  setSearchParams,
  handleAddParam,
  additionalOptionsCollectionFilter,
  setStaticModelWithAnimation,
  playerRefCurrent,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [modelWithNails, setModelWithNails] = useState(false);
  const [armNailOptions, setArmNailOptions] = useState(false);
  const [nailsAvailable, setnailsAvailable] = useState(false);
  const [legSwitchAvailable, setlegSwitchAvailable] = useState(false);
  const [seatCushionSwitchAvailable, setseatCushionSwitchAvailable] = useState(false);
  const [weltOptions, setWeltOptions] = useState(false);

  //Options availability listeners
  useEffect(() => {
    window.addEventListener('nailsAvailable', () => setnailsAvailable(true));
    window.addEventListener('nailsNotAvailable', () => setnailsAvailable(false));
  }
    , []);


  useEffect(() => {
    window.addEventListener('weltOptions', () => setWeltOptions(true));
    window.addEventListener('NoWeltOptions', () => setWeltOptions(false));

  }
    , []);


  useEffect(() => {
    window.addEventListener('legSwitchAvailable', () => setlegSwitchAvailable(true));
    window.addEventListener('legSwitchNotAvailable', () => setlegSwitchAvailable(false));
  }, []);

  useEffect(() => {
    window.addEventListener('seatCushionSwitchAvailable', () => setseatCushionSwitchAvailable(true));
    window.addEventListener('seatCushionSwitchNotAvailable', () => setseatCushionSwitchAvailable(false));
  }, []);


  const [
    brandInstanceConfiguratorTypeAdditionalOptions,
    setBrandInstanceConfiguratorTypeAdditionalOptions,
  ] = useState(null);

  const [modelUpholsteryFilter, setModelUpholsteryFilter] = useState(
    brandInstance["shorthand"] === "MF" || brandInstance["shorthand"] === "SSW"
      ? "fabric"
      : null,
  );

  const handleHomeButton = () => {
    const currentUrl = window.location.href;
    const url = new URL(currentUrl);
    url.search = '';
    const newUrl = url.toString();
    if (newUrl !== currentUrl) {
      window.location.href = newUrl;
    }
  };



  //set nail options
  useEffect(() => {
    if (window.player && window.player.selectedArmType) {
      setArmNailOptions(window.player.selectedArmType.nails);
    }
  }, [nailsAvailable]);

  const [activeIcon, setActiveIcon] = useState("model");

  const reloadPage = () => {
    window.player.dispose();
    window.history.back();

    const onPopState = () => {
      window.location.reload();
      window.removeEventListener('popstate', onPopState);
    };

    window.addEventListener('popstate', onPopState);
  };

  const handleIconClick = (icon) => {
    if (icon === activeIcon) {
      setIsOpen(!isOpen);
    } else {
      setActiveIcon(icon);
      setIsOpen(true);
    }
    setTimeout(() => { window.player.resize(); }, 1);
  };

  const handleActiveIcon = () => {
    window.player.updateCameraPosition();
  };

  const handleIsOpen = () => {
    setIsOpen(!isOpen);

    setTimeout(() => { window.player.resize(); }, 1);
  };

  const handleBottomSidebarClick = (icon) => {
    if (!isLeftSidebar) {
      handleIconClick(icon);
    }
  };

  useEffect(() => {
    if (
      additionalOptionsCollectionFilter &&
      brandInstanceConfiguratorType.additionalOptions
    )
      setBrandInstanceConfiguratorTypeAdditionalOptions(
        brandInstanceConfiguratorType?.additionalOptions[
        additionalOptionsCollectionFilter
        ],
      );
  }, [
    brandInstanceOptions,
    setBrandInstanceConfiguratorTypeAdditionalOptions,
    brandInstanceConfiguratorType,
    additionalOptionsCollectionFilter,
  ]);
  return (
    <>
      <section
        className={isLeftSidebar ? "leftsidebar-test" : "bottomsidebar-test"}
      >
        <div
          className={
            isLeftSidebar ? "leftsidebar-section" : "bottomsidebar-section"
          }
          onClick={() => handleBottomSidebarClick(activeIcon)}
        >
          <div
            id='jola-logo'
            className={isLeftSidebar ? "" : "display-none"}
            onClick={handleHomeButton}
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='63'
              height='65'
              viewBox='0 0 63 65'
              fill='none'
            >
              <g clipPath='url(#clip0_329_1072)'>
                <path
                  d='M48.3751 30.0072C51.4616 16.8634 43.2789 3.71959 30.0962 0.642155C16.9232 -2.42569 3.74048 5.73286 0.653937 18.8671C-2.4326 32.0109 5.75009 45.1547 18.9328 48.2321C32.1155 51.3096 45.2982 43.151 48.3847 30.0072H48.3751ZM15.5289 22.3472C16.6924 17.4003 21.6539 14.3324 26.6155 15.4924C31.577 16.6525 34.6539 21.5994 33.4905 26.5463C32.327 31.4932 27.3655 34.561 22.4039 33.401C17.4424 32.241 14.3655 27.2941 15.5289 22.3472Z'
                  fill='#F07F25'
                />
                <path
                  d='M52.9423 65C58.4971 65 63 60.5103 63 54.972C63 49.4337 58.4971 44.944 52.9423 44.944C47.3876 44.944 42.8846 49.4337 42.8846 54.972C42.8846 60.5103 47.3876 65 52.9423 65Z'
                  fill='#F39358'
                />
              </g>
              <defs>
                <clipPath id='clip0_329_1072'>
                  <rect width='63' height='65' fill='white' />
                </clipPath>
              </defs>
            </svg>

            <div className='back-to-brands-button' onClick={() => reloadPage()}>
              <img src={backButtonImage} alt='' />
            </div>
          </div>
          <div className={isLeftSidebar ? "leftsidebar" : "bottomsidebar"}>
            <div
              title='Select Model'
              className={`${isLeftSidebar ? "leftsidebar-icons" : " bottomsidebar-text"
                } ${activeIcon === "model" ? "active" : ""} `}
              onClick={(e) => {
                e.stopPropagation();
                handleIconClick("model");
                handleActiveIcon();
              }}
            >
              <h1 className={isLeftSidebar ? "display-none" : ""}>
                Select Model
              </h1>
              <ModelIcon className={isLeftSidebar ? "" : "display-none"} stroke={`#333333 ${activeIcon === "model" ? "active" : ""} `}></ModelIcon>
            </div>

            <div
              title='Select Upholstery'
              className={`${isLeftSidebar ? "leftsidebar-icons" : " bottomsidebar-text"
                } ${activeIcon === "upholstery" ? "active" : ""}`}
              onClick={(e) => {
                handleActiveIcon();
                e.stopPropagation();
                handleIconClick("upholstery");
              }}
            >
              <h1 className={isLeftSidebar ? "display-none" : ""}>
                Upholstery{" "}
              </h1>
              <UpholsteryIcon className={isLeftSidebar ? "" : "display-none"} stroke={`#333333 ${activeIcon === "upholstery" ? "active" : ""}`}></UpholsteryIcon>
            </div>

            {/* FINISH OPTIONS */}

            <div
              title='Select Finish'
              className={`${isLeftSidebar ? "leftsidebar-icons" : " bottomsidebar-text"
                } ${activeIcon === "finish" ? "active" : ""}`}
              onClick={(e) => {
                handleActiveIcon();
                e.stopPropagation();
                handleIconClick("finish");
              }}
            >
              <h1 className={isLeftSidebar ? "display-none" : ""}>
                Upholstery{" "}
              </h1>
              <FinishIcon width={"34px"} height={"34px"} className={isLeftSidebar ? "" : "display-none"} stroke={`#333333 ${activeIcon === "finish" ? "active" : ""}`}></FinishIcon>
            </div>


            {/* ARM TYPES */}
            {brandInstanceConfiguratorTypeAdditionalOptions &&
              brandInstanceConfiguratorTypeAdditionalOptions["armTypes"] && (
                <div
                  title='Select Arm Type'
                  className={`${isLeftSidebar ? "leftsidebar-icons" : " bottomsidebar-text"
                    } ${activeIcon === "armTypes" ? "active" : ""}     `}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleIconClick("armTypes");
                    handleActiveIcon();
                  }}
                >
                  <h1 className={isLeftSidebar ? "display-none" : ""}>
                    Select Arm Type
                  </h1>
                  <img src={armStyleImage} alt='arm style' />
                </div>
              )}

            {/* BACK TYPES */}
            {brandInstanceConfiguratorTypeAdditionalOptions &&
              brandInstanceConfiguratorTypeAdditionalOptions["backTypes"] && (
                <div
                  title='Select Back Type'
                  className={`${isLeftSidebar ? "leftsidebar-icons" : " bottomsidebar-text"
                    } ${activeIcon === "backTypes" ? "active" : ""}     `}


                  onClick={(e) => {
                    e.stopPropagation();
                    handleIconClick("backTypes");
                    handleActiveIcon();
                  }}
                >
                  <h1 className={isLeftSidebar ? "display-none" : ""}>
                    Select Back Type
                  </h1>
                  <img src={backStyleImage} alt='Back Style icon' />
                </div>
              )}
            {/* SEAT CUSHION TYPES */}
            {seatCushionSwitchAvailable && (
              <div
                title='Select Stitch Type'
                className={`${isLeftSidebar ? "leftsidebar-icons" : " bottomsidebar-text"
                  } ${activeIcon === "seatCushionTypes" ? "active" : ""}     `}

                onClick={(e) => {
                  e.stopPropagation();
                  handleIconClick("seatCushionTypes");
                  handleActiveIcon();
                }}
              >
                <h1 className={isLeftSidebar ? "display-none" : ""}>
                  Select Stitch Type
                </h1>
                <SeatCushionIcon width={"45px"} height={"45px"} className={isLeftSidebar ? "" : "display-none"} stroke={`#333333 ${activeIcon === "finish" ? "active" : ""}`}></SeatCushionIcon>

              </div>
            )}

            {/* STITCH TYPES */}
            {brandInstanceConfiguratorTypeAdditionalOptions &&
              brandInstanceConfiguratorTypeAdditionalOptions["stitchTypes"] && (
                <div
                  title='Select Stitch Type'
                  className={`${isLeftSidebar ? "leftsidebar-icons" : " bottomsidebar-text"
                    } ${activeIcon === "stitchTypes" ? "active" : ""}     `}

                  onClick={(e) => {
                    e.stopPropagation();
                    handleIconClick("stitchTypes");
                    handleActiveIcon();
                  }}
                >
                  <h1 className={isLeftSidebar ? "display-none" : ""}>
                    Select Stitch Type
                  </h1>
                  <img src={baseStyleImage} alt='Stitch Style Icon' />
                </div>
              )}

            {/* BASE TYPES */}
            {(legSwitchAvailable) && (
              <div
                title='Select Base Type'
                className={`${isLeftSidebar ? "leftsidebar-icons" : " bottomsidebar-text"
                  } ${activeIcon === "baseTypes" ? "active" : ""}     `}


                onClick={(e) => {
                  e.stopPropagation();
                  handleIconClick("baseTypes");
                  handleActiveIcon();
                }}
              >
                <h1 className={isLeftSidebar ? "display-none" : ""}>
                  Select Base Type
                </h1>
                <img src={baseStyleImage} alt='Base Style Icon' />
              </div>
            )}


            {(modelWithNails || nailsAvailable) && (
              <div
                title='Select Nails'
                className={`${isLeftSidebar ? "leftsidebar-icons" : " bottomsidebar-text"
                  } ${activeIcon === "nails" ? "active" : ""}`}


                onClick={(e) => {
                  e.stopPropagation();
                  handleIconClick("nails");
                  handleActiveIcon();
                }}
              >
                <h1 className={isLeftSidebar ? "display-none" : ""}>Nails</h1>
                <NailsIcon className={isLeftSidebar ? "" : "display-none"} stroke={`#333333 ${activeIcon === "nails" ? "active" : ""}`}></NailsIcon>
              </div>
            )}
            {(weltOptions) && (
              <div
                title='Select Welt Option'
                className={`${isLeftSidebar ? "leftsidebar-icons" : " bottomsidebar-text"
                  } ${activeIcon === "weltOptions" ? "active" : ""}`}

                onClick={(e) => {
                  e.stopPropagation();
                  handleIconClick("weltOptions");
                  handleActiveIcon();
                }}
              >
                <h1 className={isLeftSidebar ? "display-none" : ""}> Welt Options</h1>

                <WeltIcon className={isLeftSidebar ? "" : "display-none"} stroke={`#333333 ${activeIcon === "weltOptions" ? "active" : ""}`}></WeltIcon>

              </div>
            )}
          </div>
        </div>
        <div>
          {isOpen ? (
            <LeftSidebarSelect
              activeIcon={activeIcon}
              itemClicked={itemClicked}
              setItemClicked={setItemClicked}
              isLeftSidebar={isLeftSidebar}
              setActiveIcon={setActiveIcon}
              activePlayer={activePlayer}
              playerInstance={playerInstance}
              currentClassList={currentClassList}
              setCurrentClassList={setCurrentClassList}
              selectedOption={selectedOption}
              setSelectedOption={setSelectedOption}
              modelWithNails={modelWithNails}
              setModelWithNails={setModelWithNails}
              brandInstance={brandInstance}
              brandInstanceStaticFramesNumberOfBatches={
                brandInstanceStaticFramesNumberOfBatches
              }
              brandInstanceOptions={brandInstanceOptions}
              brandInstanceConfiguratorType={brandInstanceConfiguratorType}
              brandInstanceConfiguratorTypes={brandInstanceConfiguratorTypes}
              setBrandInstanceConfiguratorType={
                setBrandInstanceConfiguratorType
              }
              brandInstanceConfiguratorTypeAdditionalOptions={
                brandInstanceConfiguratorTypeAdditionalOptions
              }
              modelUpholsteryFilter={modelUpholsteryFilter}
              setModelUpholsteryFilter={setModelUpholsteryFilter}
              collection={collection}
              setCollection={setCollection}
              handleAddParam={handleAddParam}
              additionalOptionsCollectionFilter={
                additionalOptionsCollectionFilter
              }
              setStaticModelWithAnimation={setStaticModelWithAnimation}
              playerRefCurrent={playerRefCurrent}
              armNailOptions={armNailOptions}
            />
          ) : (
            <CloseLeftSidebar
              activeIcon={activeIcon}
              isLeftSidebar={isLeftSidebar}
            />
          )}
        </div>
        <div className='leftsidebar-button'>
          <button onClick={handleIsOpen}>
            {isOpen ? (
              <img src={buttonClose} alt='buttonOpen' />
            ) : (
              <img src={buttonOpen} alt='buttonClose' />
            )}
          </button>
        </div>
      </section>
    </>
  );
};

export default LeftSidebar;
