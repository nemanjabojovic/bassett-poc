import StitchTypeMenuCard from "../StitchTypeMenuCard";

const StitchTypeMenu = ({
  playerInstance,
  stitchTypes,
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
          Select Stitch Type
        </h1>

        <StitchTypeMenuCard
          playerInstance={playerInstance}
          stitchTypes={stitchTypes}
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

export default StitchTypeMenu;
