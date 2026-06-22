import ArmTypeMenuCard from "../ArmTypeMenuCard";

const ArmTypeMenu = ({
  playerInstance,
  armTypes,
  itemClicked,
  setItemClicked,
  isLeftSidebar,
  setCurrentClassList,
  playerRefCurrent,
}) => {
  return (
    <section className='leftside-bar-menu'>
      <div className='content-wrapper'>
        <h1 className={!isLeftSidebar ? "display-none" : null}>
          Select Arm Type
        </h1>

        <ArmTypeMenuCard
          playerInstance={playerInstance}
          armTypes={armTypes}
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

export default ArmTypeMenu;
