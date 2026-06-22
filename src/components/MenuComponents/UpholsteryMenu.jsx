import React, { useEffect, useState, useMemo } from "react";
import DropdownMenu from "../DropdownMenu";
import UpholsteryMenuCard from "../UpholsteryMenuCard";

import applicationAreas from "../../components/JolaPlayer/applicationAreas.json";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

const UpholsteryMenu = ({
  data,
  activeIcon,
  itemClicked,
  setItemClicked,
  isLeftSidebar,
  currentClassList,
  setCurrentClassList,
  brandInstance,
  modelUpholsteryFilter,
  playerRefCurrent,
  avalableApplicationAreas,
}) => {
  const { leathers, fabrics } = data;

  const [selectedOption, setSelectedOption] = useState("fabric");
  const [filteredItems, setFilteredItems] = useState(fabrics);
  const [selectedApplicationArea, setselectedApplicationArea] =
    useState("PrimaryCover");

  const handleApplicationAreaChange = (e) => {
    setselectedApplicationArea(e.target.value);
  };

  const handleDropdownSelect = (selected) => {
    setFilteredItems(selected);
  };

  const isActive = (option) => (selectedOption === option ? "active" : "");

  const handleUpholsteryClick = (option) => {
    setSelectedOption(option.toLowerCase());
    if (option.toLowerCase() === "fabric") {
      let filteredFrabrics =
        brandInstance.brandShorthand === "BY"
          ? fabrics.filter((fabric) => !fabric.name.includes("Clay"))
          : fabrics;

      setFilteredItems(filteredFrabrics);
    } else if (option.toLowerCase() === "leather") {
      setFilteredItems(leathers);
    }
  };

  const areas = useMemo(() => {
    if (avalableApplicationAreas) {
      let areas = Object.keys(avalableApplicationAreas);
      let filteredAreas = applicationAreas.materialApplicationAreas.filter(
        (area) => areas.includes(area.dbValue)
      );
      return [applicationAreas.materialApplicationAreas[0], ...filteredAreas];
    }
  }, [avalableApplicationAreas]);

  const areasFromCollection = useMemo(() => {
    if (window.player && window.player.availableApplicationAreas) {
      let areasFromCollection = window.player.availableApplicationAreas;


      let filteredAreas = applicationAreas.materialApplicationAreas.filter(
        (area) => areasFromCollection.includes(area.dbValue)
      );


      return [applicationAreas.materialApplicationAreas[0], ...filteredAreas];
    }
  }, []);

  //TODO: WIP upholstery filter
  useEffect(() => {
    if (brandInstance.brandShorthand === "BY") {
      setSelectedOption("leather");
      setFilteredItems(leathers);
    } else if (modelUpholsteryFilter) {
      if (modelUpholsteryFilter === "fabric") {
        setSelectedOption("fabric");
        setFilteredItems(fabrics);
      } else {
        setSelectedOption("leather");
        setFilteredItems(leathers);
      }
    } else {
      setSelectedOption("fabric");
      setFilteredItems(fabrics);
    }
  }, [modelUpholsteryFilter, leathers, fabrics, brandInstance]);

  return (
    <section
      className={isLeftSidebar ? "leftside-bar-menu" : "bottomside-bar-menu"}
    >
      <div className='content-wrapper'>
        <h1 className={!isLeftSidebar ? "display-none" : null}>
          Select Upholstery
        </h1>
        <div className={`${isLeftSidebar ? "column" : "reverse-column"}`}>
          <div className='leftsidebar-input'>
            <DropdownMenu
              activeIcon={activeIcon}
              items={selectedOption === "fabric" ? fabrics : leathers}
              onSelect={handleDropdownSelect}
              setSelectedOption={setSelectedOption}
            />
          </div>

          {areas && (
            <FormControl sx={{ m: 1, minWidth: 120 }} size='small'>
              <InputLabel id='application-areas-select-label'>
                Application Areas
              </InputLabel>
              <Select
                labelId='application-areas-select-label'
                id='application-areas-select'
                value={selectedApplicationArea}
                label='applicationArea'
                onChange={handleApplicationAreaChange}
              >
                {areas &&
                  areas.map((area, index) => {
                    return (
                      <MenuItem
                        key={area.dbValue || index}
                        value={area.dbValue}
                      >
                        {area.name}
                      </MenuItem>
                    );
                  })}
              </Select>
            </FormControl>
          )}


          {areasFromCollection && (
            <FormControl sx={{ m: 1, minWidth: 120 }} size='small'>
              <InputLabel id='application-areas-select-label'>
                Application Areas
              </InputLabel>
              <Select
                labelId='application-areas-select-label'
                id='application-areas-select'
                value={selectedApplicationArea}
                label='applicationArea'
                onChange={handleApplicationAreaChange}
              >
                {areasFromCollection &&
                  areasFromCollection.map((area, index) => {
                    return (
                      <MenuItem
                        key={area.dbValue || index}
                        value={area.dbValue}
                      >
                        {area.name}
                      </MenuItem>
                    );
                  })}
              </Select>
            </FormControl>
          )}
          {(areas || areasFromCollection) && (

            <div className="resetApplicationAreasWrapper">
              <button className='resetApplicationAreasButton'
                onClick={() => {
                  setselectedApplicationArea('PrimaryCover');
                  window.player.removeAdditionalMaterials();
                }}
              >Reset To Base Fabric</button>

            </div>


          )}

          <div
            className={`leftsidebar-pick ${!isLeftSidebar ? "bottomsidebar-pick" : ""
              }`}
            style={{
              justifyContent: !isLeftSidebar ? "center" : "start",
              flexDirection:
                brandInstance.brandShorthand === "BY" ? "row-reverse" : "row",
            }}
          >
            {/* TODO: WIP Upholstery Filter */}
            {(!modelUpholsteryFilter || modelUpholsteryFilter === "fabric") && (
              <h1
                onClick={() => handleUpholsteryClick("Fabric")}
                className={isActive("fabric")}
              >
                Fabric
              </h1>
            )}
            {
              (modelUpholsteryFilter === "leather" || brandInstance.brandShorthand === "BY") && (
                <h1
                  onClick={() => handleUpholsteryClick("Leather")}
                  className={isActive("leather")}
                >
                  Leather
                </h1>
              )}
          </div>
        </div>
        <UpholsteryMenuCard
          items={filteredItems}
          itemClicked={itemClicked}
          setItemClicked={setItemClicked}
          isLeftSidebar={isLeftSidebar}
          selectedOption={selectedOption}
          setCurrentClassList={setCurrentClassList}
          brandInstance={brandInstance}
          playerRefCurrent={playerRefCurrent}
          targetedApplicationArea={selectedApplicationArea}
        />
      </div>
    </section>
  );
};

export default UpholsteryMenu;
