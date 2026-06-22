import React from "react";

const SpecificationInfo = ({ itemClicked, playerInstance }) => {
  if (playerInstance) {
    let name;
    if (playerInstance?.defaultFabric) name = playerInstance.defaultFabric.name;
    else name = "";

    return (
      <div className='specification-info'>
        <p className='fabric'>
          {/* // TODO - Fix condition after player is connected */}
          Body Fabric: <span>{name}</span>
        </p>
        <p className='dimensions'>
          Dimensions: <span className='width'>---</span>" W |{" "}
          <span className='depth'>---</span>" D |{" "}
          <span className='height'>---</span>" H
        </p>
        <p className='weight'>
          {/* // TODO If more elements count weight below */}
          Weight: <span>---</span> kg
        </p>
      </div>
    );
  }
};

export default SpecificationInfo;
