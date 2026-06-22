import { useEffect, useState } from "react";
import WeltOptionMenuCard from "../WeltOptionMenuCard";

const WeltOptionMenu = ({
  playerInstance,
  itemClicked,
  setItemClicked,
  isLeftSidebar,
  setCurrentClassList,
  playerRefCurrent,
}) => {
  const areas = [{ "name": 'Cushion', "dataKey": 'cushion' }, { "name": 'Front Pillow', "dataKey": 'frontPillow' }, { "name": 'Back Pillow', "dataKey": 'backPillow' }];
  const [weltOptions, setWeltOptions] = useState([{ "name": "NoWelt" }, { "name": "SelfWelt" }, { "name": "Flange" }]);
  const [weltArea, setWeltArea] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);

  const [filteredAreas, setFilteredAreas] = useState(null);
  const [filteredOptions, setFilteredOptions] = useState(null);

  const isActive = (option) => (selectedOption.name === option.name ? "active" : "");

  const handleAreaClick = (option) => {
    setSelectedOption(option);
    setWeltArea(option.name);
  };

  useEffect(() => {
    const weltOptions = window.player.selectedFrame.weltOptions;
    if (weltOptions && selectedOption === null) {
      const firstOption = Object.keys(window.player.selectedFrame.weltOptions)[0].replace(/\b\w/g, c => c.toUpperCase());

      setSelectedOption(areas.find(area => area.name === firstOption));
      setWeltArea(firstOption);
      setFilteredAreas(areas.filter(area => Object.keys(window.player.selectedFrame.weltOptions).includes(area.dataKey)));
    } else {
      setFilteredOptions(window.player.selectedFrame.weltOptions[selectedOption.dataKey]);
    }
  }, [window.player.selectedFrame, selectedOption]);
  return (
    <section
      className={isLeftSidebar ? "leftside-bar-menu" : "bottomside-bar-menu"}
    >
      <div className='content-wrapper'>
        <h1 className={!isLeftSidebar ? "display-none" : null}>
          Select Welt Option
        </h1>

        <div className={`${isLeftSidebar ? "column" : "reverse-column"}`}>
          <div
            className={`leftsidebar-pick ${!isLeftSidebar ? "bottomsidebar-pick" : ""
              }`}
            style={{
              justifyContent: !isLeftSidebar ? "center" : "start",
              flexDirection:
                "row",
            }}
          >
            {filteredAreas && filteredAreas.map((area, index) => (
              <h1 key={index}
                onClick={() => handleAreaClick(area)}
                className={isActive(area)}
              >
                {area.name}
              </h1>
            )

            )}
          </div>
        </div>


        <WeltOptionMenuCard
          playerInstance={playerInstance}
          itemClicked={itemClicked}
          setItemClicked={setItemClicked}
          isLeftSidebar={isLeftSidebar}
          setCurrentClassList={setCurrentClassList}
          playerRefCurrent={playerRefCurrent}
          weltArea={weltArea}
          weltOptions={weltOptions}
          filteredOptions={filteredOptions}
        />
      </div>
    </section>
  );
};

export default WeltOptionMenu;
