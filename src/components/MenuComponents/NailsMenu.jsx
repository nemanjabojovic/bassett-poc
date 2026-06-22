import { useState } from "react";
import Switch from "@mui/material/Switch";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import data from "../JolaPlayer/data.json";
import NailsMenuCard from "../NailsMenuCard";

const NailsMenu = ({
  itemClicked,
  setItemClicked,
  isLeftSidebar,
  currentClassList,
  setCurrentClassList,
  setModelUpholsteryFilter,
  setModelWithNails,
  modelWithNails,
  armNailOptions
}) => {
  const [checked, setChecked] = useState(true);

  const [nailSize, setnailSize] = useState("");
  const [nailSize2, setnailSize2] = useState("");

  const handleNailSizeStandardChange = (e) => {
    setnailSize(e.target.value);

    window.player.setNailOptionStandard(e.target.value);
  };
  const handleNailSizeStandard2Change = (e) => {
    setnailSize2(e.target.value);

    window.player.setNailOptionStandard2(e.target.value);
  };

  const handleChange = (event) => {
    setChecked(event.target.checked);

    window.player.setNailsVisible(!checked);
  };


  return (
    <section className='leftside-bar-menu'>
      <div className='content-wrapper'>
        <h1 className={!isLeftSidebar ? "display-none" : null}>
          Select Nail Options
        </h1>

        <div className='nail-visibility-switch'>
          <Switch
            checked={checked}
            onChange={handleChange}
            color='warning'
            inputProps={{ "aria-label": "controlled" }}
          />
          <label htmlFor='show-hidden-nails'>
            {checked ? "Nails visible" : "Nails hiiden"}
          </label>
        </div>

        <div>
          {((modelWithNails.standardNail && modelWithNails.standardNailNone) || (armNailOptions.standardNail && armNailOptions.standardNailNone)) && (
            <FormControl sx={{ m: 1, minWidth: 120 }} size='small'>
              <InputLabel id='demo-simple-select-helper-label'>
                Nails 1
              </InputLabel>
              <Select
                labelId='demo-simple-select-helper-label'
                id='demo-simple-select-helper'
                value={nailSize}
                label='nailSize'
                onChange={handleNailSizeStandardChange}
              >
                <MenuItem value={"none"}>none</MenuItem>
                {(modelWithNails["standardNail#9"] || armNailOptions['standardNail9'] || armNailOptions['standardNail#9']) && (
                  <MenuItem value={"#9"}>#9</MenuItem>
                )}
                {(modelWithNails["standardNail#54"] || armNailOptions['standardNail54'] || armNailOptions['standardNail#54']) && (
                  <MenuItem value={"#54"}>#54</MenuItem>
                )}
                {modelWithNails["standardNail#6"] && (
                  <MenuItem value={"#6"}>#6</MenuItem>
                )}
                {modelWithNails["standardNail#7"] && (
                  <MenuItem value={"#7"}>#7</MenuItem>
                )}
              </Select>
            </FormControl>
          )}
          {modelWithNails.standardNail2 && modelWithNails.standardNail2None && (
            <FormControl sx={{ m: 1, minWidth: 120 }} size='small'>
              <InputLabel id='demo-simple-select-helper-label'>
                Nails 2
              </InputLabel>
              <Select
                labelId='demo-simple-select-helper-label'
                id='demo-simple-select-helper'
                value={nailSize2}
                label='nailSize'
                onChange={handleNailSizeStandard2Change}
              >
                <MenuItem value={"none"}>none</MenuItem>
                {modelWithNails["standardNail2#9"] && (
                  <MenuItem value={"#9"}>#9</MenuItem>
                )}
                {modelWithNails["standardNail2#54"] && (
                  <MenuItem value={"#54"}>#54</MenuItem>
                )}
                {modelWithNails["standardNail2#6"] && (
                  <MenuItem value={"#6"}>#6</MenuItem>
                )}
                {modelWithNails["standardNail2#7"] && (
                  <MenuItem value={"#7"}>#7</MenuItem>
                )}
              </Select>
            </FormControl>
          )}
        </div>

        <NailsMenuCard
          items={data.nailColors}
          itemClicked={itemClicked}
          setItemClicked={setItemClicked}
          selectedOption={"nailOption"}
          isLeftSidebar={isLeftSidebar}
          currentClassList={currentClassList}
          setCurrentClassList={setCurrentClassList}
          setModelUpholsteryFilter={setModelUpholsteryFilter}
          setModelWithNails={setModelWithNails}
        />
      </div>
    </section>
  );
};

export default NailsMenu;
