import { useState } from "react";
import deleteConfiguration from "../assets/icons/deleteConfiguration.svg";
import jolaLogo from "../assets/icons/jolaLogo.svg";
import Button from "./Button";

const DeleteEditOption = ({
  setItemClicked,
  isLeftSidebar,
  setSelectedOption,
}) => {
  const [editConfigurationSelected, setEditConfigurationSelected] =
    useState(false);

  const handleDelete = async () => {
    if (document.querySelector(".drag-and-drop-buttons"))
      document
        .querySelector(".drag-and-drop-buttons")
        .classList.add("display-none");
    if (document.querySelector(".selectedElementDiv"))
      document
        .querySelector(".selectedElementDiv")
        .classList.add("display-none");
    setItemClicked(null);

    setEditConfigurationSelected(false);
    window.player.editSelected = false;

    await window.player.clearConfiguration();
  };



  return (
    <div className='delete-edit-section'>
      {!isLeftSidebar && <img src={jolaLogo} alt='jola' className='jolaLogo' />}

      <div className='clearConfiguration'>
        <Button
          icon={<img src={deleteConfiguration} alt='deleteConfiguration' />}
          text='Clear Configuration'
          className='delete-edit-button'
          onClick={handleDelete}
        />
      </div>
    </div>
  );
};

export default DeleteEditOption;
