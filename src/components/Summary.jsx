import React from "react";

const Summary = ({ setShowSummary }) => {
  return (
    <div className='summaryBottom'>
      <div className='escapeButton'>
        <p onClick={() => setShowSummary(false)}>X</p>
        <img src='/resources/icons/Close.png' alt='' />
      </div>
      <div className='summaryBottomBothSides mainText '>
        <h1>Your Design</h1>
        <p>
          Below you will find the list of all your selections for your build
        </p>
      </div>
      <div className='summaryBottomBothSides main'>
        <img className='summaryPhoto' src='/resources/floor/none.webp' alt='' />
        <div className='summaryLeftSide'>
          <p className='soleilLt'>CONFIGURED SKUs</p>
          <p className='soleilLt'>Dimensions</p>
        </div>
        <div className='summaryRightSide'>
          <p id='configuredSKU' className='soleilLt'>
            5W/1W/1L/S2/4W
          </p>
          <p id='summaryDimensions' className='soleilLt'>
            H35" W128" D128"
          </p>
        </div>
      </div>
      <div className='horizontalSeparator'></div>
      <div className='summaryBottomBothSides summaryBuilds summaryModels'>
        <div className='summaryLeftSide'>
          <p className='soleilLt'>Your Build</p>
        </div>
        <div className='summaryRightSide'>
          <div className='summaryRightSideItems'>
            <div>
              <img src='../../images/1H.jpg' alt='' />
              <p className='soleilLt'></p>
            </div>
          </div>
          <div className='horizontalSeparator'></div>
        </div>
      </div>
      <div className='summaryBottomBothSides summaryBuilds summaryUpholstery'>
        <div className='summaryLeftSide'>
          <p className='soleilLt'>Upholstery</p>
        </div>
        <div className='summaryRightSide'>
          <div className='summaryRightSideItems'>
            <div>
              <p className='soleilLt'>Model Finish</p>
              <img className='materialItem' src='' alt='' />
              <p style={{ marginTop: "10px" }} className='soleilLt'></p>
            </div>
          </div>
          <div className='horizontalSeparator'></div>
        </div>
      </div>
      <div className='summaryBottomBothSides summaryBuilds summaryLeg'>
        <div className='summaryLeftSide'>
          <p className='soleilLt'>Leg</p>
        </div>
        <div className='summaryRightSide'>
          <div className='summaryRightSideItems'>
            <div>
              <p className='soleilLt'></p>
              <img src='' alt='' />
            </div>
          </div>
          <div className='horizontalSeparator'></div>
        </div>
      </div>
      <div className='summaryBottomBothSides summaryBuilds summaryAccessories displayNone'>
        <div className='summaryLeftSide'>
          <p className='soleilLt'>Accessories</p>
        </div>
        <div className='summaryRightSide'>
          <div className='summaryRightSideItems'>
            <div className='charger'>
              <p className='soleilLt'></p>
              <img src='' alt='' />
            </div>

            <div className='laptopTable'>
              <p className='soleilLt'></p>
              <img src='' alt='' />
            </div>
          </div>
        </div>
      </div>
      <div className='horizontalSeparator'></div>
      <div className='summaryBottomBothSides summaryDescription'>
        <div className='summaryLeftSide'>
          <p className='soleilLt'>Description</p>
        </div>
        <div className='summaryRightSide'>
          <p className='soleilLt'>
            Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean
            commodo ligula eget dolor. Aenean massa. Cum sociis natoque
            penatibus et magnis dis parturient montes,
          </p>
        </div>
      </div>
      <div className='horizontalSeparator'></div>
      <div className='summary-button'>
        <p className='expanded light soleilLt'>Technical Specs</p>
        <p className='expanded dark'>Save & Share</p>
      </div>
    </div>
  );
};

export default Summary;
