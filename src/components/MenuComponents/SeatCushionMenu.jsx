import SeatCushionMenuCard from "../SeatCushionMenuCard";

const SeatCushionMenu = ({
  playerInstance,
  seatCushionTypes,
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

        <SeatCushionMenuCard
          playerInstance={playerInstance}
          seatCushionTypes={seatCushionTypes}
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

export default SeatCushionMenu;
