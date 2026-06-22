import FinishMenuCard from "../FinishMenuCard";


const FinishMenu = ({
  data,
  itemClicked,
  setItemClicked,
  isLeftSidebar,
  setCurrentClassList,
  brandInstance,
  playerRefCurrent,
}) => {
  //TODO: Remove if filtering not needed in future (pass filtered to FinishMenuCard.items)
  // const [filteredItems, setFilteredItems] = useState(finishes);

  return (
    <section
      className={isLeftSidebar ? "leftside-bar-menu" : "bottomside-bar-menu"}
    >
      <div className='content-wrapper'>
        <h1 className={!isLeftSidebar ? "display-none" : null}>
          Select Finish
        </h1>
        <div className={`${isLeftSidebar ? "column" : "reverse-column"}`}>
        </div>
        <FinishMenuCard
          items={data}
          itemClicked={itemClicked}
          setItemClicked={setItemClicked}
          isLeftSidebar={isLeftSidebar}
          setCurrentClassList={setCurrentClassList}
          brandInstance={brandInstance}
          playerRefCurrent={playerRefCurrent}
        />
      </div>
    </section>
  );
};

export default FinishMenu;
