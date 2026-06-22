import React from "react";
import Button from "./Button";

const PriceCtaInfo = ({
  itemClicked,
  playerInstance,
  setShowSummary,
  showSummary,
  setIsOpenAdditionalOption,
}) => {
  const handleSummary = () => {
    if (showSummary) {
      setShowSummary(false);
    } else {
      setIsOpenAdditionalOption(false);
      setShowSummary(true);
      setTimeout(() => {
        playerInstance.showSummary();
      }, 1000);
    }
  };

  return (
    <div className='price-cta-info'>
      {/* //TODO - Yet to be done > summary for price */}
      <p className='info-price'>
        {/* {itemClicked?.price ? formatPrice(itemClicked.price) : ""} */}
        <span></span>
      </p>
      <Button
        className='light'
        text='VIEW SUMMARY'
        onClick={() => handleSummary()}
      />
      <Button className='dark' text='ADD TO CART' />
    </div>
  );
};

export default PriceCtaInfo;
