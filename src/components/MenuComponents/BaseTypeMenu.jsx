import BaseTypeMenuCard from "../BaseTypeMenuCard";

const BaseTypeMenu = ({
  playerInstance,
  baseTypes,
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
          Select Base Type
        </h1>

        <BaseTypeMenuCard
          playerInstance={playerInstance}
          baseTypes={baseTypes}
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

export default BaseTypeMenu;
