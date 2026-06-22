import BackTypeMenuCard from "../BackTypeMenuCard";

const BackTypeMenu = ({
  playerInstance,
  backTypes,
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
          Select Back Type
        </h1>

        <BackTypeMenuCard
          playerInstance={playerInstance}
          backTypes={backTypes}
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

export default BackTypeMenu;
