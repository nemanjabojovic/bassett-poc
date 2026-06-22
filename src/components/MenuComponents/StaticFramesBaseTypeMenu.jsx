import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import StaticFramesBaseTypeMenuCard from "../StaticFramesBaseTypeMenuCard";

const StaticFramesBaseTypeMenu = ({
  playerInstance,
  baseTypes,
  itemClicked,
  setItemClicked,
  isLeftSidebar,
  setCurrentClassList,
  playerRefCurrent,
}) => {
  const [searchParams] = useSearchParams();
  const [searchParamsModel] = useState(
    searchParams.get("model")
  );

  const [baseOptions, setBaseOptions] = useState(null);

  useEffect(() => {
    setBaseOptions(window.player.data.frames.find(frame => frame.id === searchParamsModel).legSwitch);
  }, [searchParamsModel]);


  return (
    <section className='leftside-bar-menu'>
      <div className='content-wrapper'>
        <h1 className={!isLeftSidebar ? "display-none" : null}>
          Select Base Type
        </h1>

        <StaticFramesBaseTypeMenuCard
          playerInstance={playerInstance}
          baseTypes={baseOptions || []}
          itemClicked={itemClicked}
          setItemClicked={setItemClicked}
          isLeftSidebar={isLeftSidebar}
          setCurrentClassList={setCurrentClassList}
          playerRefCurrent={playerRefCurrent}
        />
      </div>
    </section>
  );
};

export default StaticFramesBaseTypeMenu;
